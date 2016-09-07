<?php

/**
 * Maintenance script to remove <imap /> tags from articles
 *
 * @usage SERVER_ID=203236 php removeImapTags.php --tiles-set-id=1 --quiet --test
 */

require_once( __DIR__ . '/../../Maintenance.php' );

ini_set( "include_path", __DIR__ . "/../../" );
ini_set('display_errors', 'stderr');
ini_set('error_reporting', E_ALL);

class RemoveImapTags extends Maintenance {
	static protected $test = false;

	private $maps;

	/**
	 * @var Array
	 */
	private $mapsClientConfig;

	public function __construct() {
		parent::__construct();
		$this->mDescription = "Removes from articles <imap /> tags for given tiles' set id.";
		$this->addOption( 'test', 'Test mode; make no changes', $required = false, $withArg = false, 't' );
		$this->addOption( 'maps-db-host', 'WikiaMaps DB host', $required = true, $withArg = true );
		$this->addOption( 'maps-db-user', 'WikiaMaps DB user', $required = true, $withArg = true );
		$this->addOption( 'maps-db-pass', 'WikiaMaps DB pass', $required = true, $withArg = true );
		$this->addOption( 'maps-db-name', 'WikiaMaps DB name', $required = true, $withArg = true );
		$this->addOption(
			'tiles-set-id',
			'Specify a tiles\' set id which leads to a group of maps which <imap /> tags should get removed',
			$required = true,
			$withArg = true,
			'tsi'
		);
	}

	static public function isTest() {
		return self::$test;
	}

	static public function isNaturalNumber( $int ) {
		return intval( $int ) > 0;
	}

	public function getMapsIdsUsingTileset( $cityId, $tilesSetId ) {
		$dbw = new DatabaseMysqli(
			$this->getOption('maps-db-host'),
			$this->getOption('maps-db-user'),
			$this->getOption('maps-db-pass'),
			$this->getOption('maps-db-name')
		);

		return $dbw->selectFieldValues( 'map', 'id', [
				'city_id' => $cityId,
				'tile_set_id' => $tilesSetId
		] );
	}

	public function getArticlesIdsUsingImap( $cityId ) {
		global $wgStatsDB;

		$dbw = wfGetDB(DB_SLAVE, array(), $wgStatsDB);
		return $dbw->selectFieldValues( 'city_used_tags', 'ct_page_id', [
			'ct_wikia_id' => $cityId,
			'ct_kind' => 'imap'
		] );
	}

	public function hasImapTag( $articleId, &$foundTags, &$foundTagsMapIds ) {
		$article = Article::newFromID( $articleId );

		if ( $article instanceof Article && $article->getID() ) {
			$results = null;
			$articleContent = $article->getContent();
			$imapSearchRegexp = "/<imap.*map\-id\=['\"](\d{1,})['\"].*(<\/imap|\/)>/";

			$noOfFoundTags = preg_match_all($imapSearchRegexp, $articleContent, $results);

			if( $noOfFoundTags === 0 ) {
				return false;
			}

			$foundTags = $results[0];
			$foundTagsMapIds = $results[1];

			return true;
		} else {
			$this->output( sprintf( 'Article #%d does not exist anymore', $articleId ) . PHP_EOL );
		}
	}

	public function hasTagsToRemove( $foundTagsMapIds, $mapsUsingTheTileset, &$tagsToRemoveArrayKeyIds ) {
		foreach( $foundTagsMapIds as $key => $mapId ) {
			if ( in_array( $mapId, $mapsUsingTheTileset ) ) {
				$tagsToRemoveArrayKeyIds[] = $key;
			}
		}

		return !empty( $tagsToRemoveArrayKeyIds );
	}

	public function removeImapTagFromArticle( $articleId, $stringWithTagToRemove ) {
		$user = User::newFromName( 'WikiaBot' );
		$article = Article::newFromID( $articleId );

		if ( $user->getId() === 0 ) {
			$this->output( 'Failed using WikiaBot user' . PHP_EOL );
		}

		if ( $article instanceof Article && $article->getID() ) {
			$oldContent = $article->getContent();
			$newContent = str_replace( $stringWithTagToRemove, "", $oldContent );

			$this->output( sprintf( 'Trying to edit article #%d', $articleId ) . PHP_EOL );
			if( !self::isTest() ) {
				$result = $article->doEdit(
					$newContent,
					wfMessage(
						'realmap-deprecated-info',
						'[[community:User_blog:DaNASCAT/Technical_Update:_August_29,_2016]]'
					)->text(),
					EDIT_FORCE_BOT,
					false,
					$user
				);
			} else {
				$result = true;
			}


			if( $result ) {
				$this->output( sprintf( "Removed <imap/> tags from article #%d", $articleId ) . PHP_EOL );
			} else {
				$this->output( sprintf( "Failed to update article #%d", $articleId ) . PHP_EOL );
			}
		} else {
			$this->output( sprintf( 'Article #%d does not exist anymore', $articleId ) . PHP_EOL );
		}
	}

	public function isValidTilesSetId( $tilesSetId ) {
		if ( !self::isNaturalNumber( $tilesSetId ) ) {
			return false;
		}

		$res = $this->maps->getTileSet( $tilesSetId );

		if ( !isset( $res['success'] ) || $res['success'] !== true ) {
			$this->error( 'API call failure when looking for a tiles set #' . $tilesSetId . '.' . PHP_EOL );
		}

		$this->output( "Tiles' set #" . $tilesSetId . " found." . PHP_EOL );
		return $res['content']->id == $tilesSetId;
	}

	public function execute() {
		$this->app = F::app();
		$this->mapsClientConfig = $this->app->wg->IntMapConfig;
		$this->maps = new WikiaMaps( $this->mapsClientConfig );

		self::$test = $this->hasOption( 'test' );

		$cityId = $this->app->wg->CityId;
		$tilesSetId = $this->getOption( 'tiles-set-id' );

		if ( self::isTest() ) {
			$this->output( 'Mode: test run' . PHP_EOL );
		} else {
			$this->output( 'Mode: normal run' . PHP_EOL );
		}

		if ( !$this->isValidTilesSetId( $tilesSetId ) ) {
			$this->error( 'Invalid tiles-set-id. Try again.' . PHP_EOL, 1 );
		}

		$mapsUsingTheTileset = self::getMapsIdsUsingTileset( $cityId, $tilesSetId );
		$mapsUsingTheTilesetCount = count($mapsUsingTheTileset);
		$this->output( sprintf( "Found %d maps using the tiles's set #%d", $mapsUsingTheTilesetCount, $tilesSetId ) . PHP_EOL );

		if ( $mapsUsingTheTilesetCount === 0 ) {
			$this->output( 'No maps found.' . PHP_EOL );
		}

		$articlesUsingImap = self::getArticlesIdsUsingImap( $cityId );
		$articlesUsingImapCount = count( $articlesUsingImap );
		$this->output( sprintf( "Found %d articles using <imap/>", $articlesUsingImapCount ) . PHP_EOL );

		if ( $articlesUsingImapCount === 0 ) {
			$this->output( 'No articles using <imap/> found. Have you run wikia/backend/bin/specials/tags_report.pl before?' . PHP_EOL );
		}

		foreach( $articlesUsingImap as $articleId ) {
			$this->output( sprintf( "Checks article #%d", $articleId ) . PHP_EOL );

			$foundTags = [];
			$foundTagsMapIds = [];
			$toRemove = [];

			if ( !$this->hasImapTag( $articleId, $foundTags, $foundTagsMapIds ) ) {
				$this->output( sprintf( "No <imap /> tags in article #%d", $articleId ) . PHP_EOL );
			} else {
				if ( !$this->hasTagsToRemove( $foundTagsMapIds, $mapsUsingTheTileset, $toRemove ) ) {
					$this->output( "No <imap /> for the given map ids" . PHP_EOL );
				}

				foreach( $toRemove as $foundTagsKey ) {
					$stringWithTagToRemove = $foundTags[$foundTagsKey];
					$this->removeImapTagFromArticle( $articleId, $stringWithTagToRemove );
				}
			}
		}

		$this->output( 'Done' . PHP_EOL );
	}
}

$maintClass = "RemoveImapTags";
require_once( RUN_MAINTENANCE_IF_MAIN );
