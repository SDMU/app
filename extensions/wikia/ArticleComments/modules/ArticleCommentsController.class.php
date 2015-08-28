<?php
class ArticleCommentsController extends WikiaController {
	use Wikia\Logger\Loggable;

	private $dataLoaded = false;
	private static $content = null;

	public function executeIndex() {
		if ( class_exists( 'ArticleCommentInit' ) && ArticleCommentInit::ArticleCommentCheck() ) {
			$isMobile = $this->app->checkSkin( 'wikiamobile' );

			$this->page = $this->wg->request->getVal( 'page', 1 );
			$this->isLoadingOnDemand = ArticleComment::isLoadingOnDemand();
			$this->isMiniEditorEnabled = ArticleComment::isMiniEditorEnabled();

			if ( $this->isLoadingOnDemand ) {
				$this->response->setJsVar( 'wgArticleCommentsLoadOnDemand', true );

			} else {
				$this->getCommentsData( $this->wg->Title, $this->page );

				if ( $isMobile ) {
					$this->forward( __CLASS__, 'WikiaMobileIndex', false );

				} else if ( $this->app->checkSkin( 'oasis' ) ) {
					$this->response->addAsset( 'articlecomments' . ( $this->isMiniEditorEnabled ? '_mini_editor' : '' ) . '_scss' );
				}
			}
		}
	}

	/**
	 * The content for an article page. This is included on the index (for the current title)
	 * if lazy loading is disabled, otherwise it is requested via AJAX.
	 */
	public function content() {
		//this is coming via ajax we need to set correct wgTitle ourselves
		global $wgTitle;

		$articleId = $this->request->getVal( 'articleId', null );
		$page = $this->request->getVal( 'page', 1 );
		$title = null;

		if ( !empty( $articleId ) ) {
			$wgTitle = $title = Title::newFromID( $articleId );
		}

		if ( !( $title instanceof Title ) ) {
			$title = $this->wg->title;
		}

		// If articleId is invalid, don't trigger a fatal error, just throw a 404 and return nothing.
		if ( $title === null ) {
			$this->response->setCode( 404 );
			$this->skipRendering();
			return;
		}

		$this->getCommentsData( $title, $page );
		$this->isMiniEditorEnabled = ArticleComment::isMiniEditorEnabled();

		// Uncomment this when surrogate key purging works
		//$this->wg->Out->tagWithSurrogateKeys( ArticleComment::getSurrogateKey($articleId) );

		// When lazy loading this request it shouldn't be cached in the browser
		if ( !empty( $this->wg->ArticleCommentsLoadOnDemand ) ) {
			$this->response->setCachePolicy( WikiaResponse::CACHE_PRIVATE );
			$this->response->setCacheValidity( WikiaResponse::CACHE_DISABLED );
		}

		if ( F::app()->checkSkin( 'venus' ) ) {
			$this->overrideTemplate( 'VenusContent' );
		}
	}

	/**
	 * Overrides the main template for the WikiaMobile skin
	 *
	 * @author Federico "Lox" Lucignano <federico(at)wikia-inc.com>
	 **/
	public function executeWikiaMobileIndex() {
		/** render WikiaMobile template**/

		//unfortunately the only way to get the total number of comments (required in the skin) is to load them
		//via ArticleCommentsList::getData (cached in MemCache for 1h), still to cut down page loading times
		//we won't show them until the user doesn't request for page 1 (hence page == 0 means don't print them out)
		//this is definitely sub optimal but it's the only way until the whole extension doesn't get refactored
		//and the total of comments stored separately
		$this->response->setVal( 'requestedPage', ( $this->wg->request->getVal( 'page', 0 ) ) );
	}

	/**
	 * Overrides the template for one comment item for the WikiaMobile skin
	 *
	 * @author Federico "Lox" Lucignano <federico(at)wikia-inc.com>
	 **/
	public function executeWikiaMobileComment() {/** render WikiaMobile template**/}

	/**
	 * Renders the contents of a page of comments including post button/form and prev/next page
	 * used in the WikiaMobile skin to deliver the first page of comments via AJAX and any page of comments for non-JS browsers
	 *
	 * @author Federico "Lox" Lucignano <federico(at)wikia-inc.com>
	 **/
	public function executeWikiaMobileCommentsPage() {
		$articleID = $this->request->getInt( 'articleID' );
		$title = null;

		//set mobile skin as this is based on it
		RequestContext::getMain()->setSkin(
			Skin::newFromKey( 'wikiamobile' )
		);

		if ( !empty( $articleID ) ) {
			$title = Title::newFromId( $articleID );
		}

		if ( !( $title instanceof Title ) ) {
			$title = $this->wg->title;
		}

		$this->getCommentsData( $title, $this->wg->request->getInt( 'page', 1 ) );

		if ( $this->page > 1 ) {
			$this->response->setVal( 'prevPage', $this->page - 1 );
		}

		if ( $this->page <  $this->pagesCount ) {
			$this->response->setVal( 'nextPage', $this->page + 1 );
		}
	}

	/**
	 * Overrides the template for one comment item for the Venus skin
	 *
	 * @author macbre
	 **/
	public function executeVenusComment() {/** render Venus template**/}

	/**
	 * Overrides the template for comments list for the Venus skin
	 *
	 * @author macbre
	 **/
	public function executeVenusCommentList() {/** render Venus template**/}

	private function getCommentsData( Title $title, $page, $perPage = null, $filterid = null ) {
		$key = implode( '_', [ $title->getArticleID(), $page, $perPage, $filterid ] );
		$data = null;

		// avoid going through all this when calling the method from the same round trip for the same paramenters
		// the real DB stuff is cached by ArticleCommentList in Memcached
		if ( empty( $this->dataLoaded[ $key ] ) ) {
			$commentList = ArticleCommentList::newFromTitle( $title );

			if ( !empty( $perPage ) ) {
				$commentList->setMaxPerPage( $perPage );
			}

			if ( !empty( $filterid ) ) {
				$commentList->setId( $filterid );
			}

			$data = $commentList->getData( $page );

			$this->dataLoaded[$key] = $data;
		} else {
			$data = $this->dataLoaded[$key];
		}

		if ( empty( $data ) ) {
			// Seems like we should always have data, let's leave a log somewhere if this happens
			$this->debug( 'No data, this should not happen.', [
				'method' => __METHOD__
			] );
		}

		$this->ajaxicon = $this->wg->StylePath.'/common/images/ajax.gif';
		$this->pagesCount = ( $data['commentsPerPage'] > 0 ) ? ceil( $data['countComments'] / $data['commentsPerPage'] ) : 0;
		$this->response->setValues( $data );

		return $data;
	}

	public static function onSkinAfterContent( &$afterContentHookText ) {
		if ( !empty( self::$content ) ) {
			$afterContentHookText .= self::$content;
		}
		return true;
	}

	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		if ( class_exists( 'ArticleCommentInit' ) && ArticleCommentInit::ArticleCommentCheck() ) {
			$app = F::app();

			// This is the actual entry point for Article Comment generation
			self::$content = $app->sendRequest( 'ArticleComments', 'index' );

			// Load MiniEditor assets (oasis skin only)
			if ( ArticleComment::isMiniEditorEnabled() ) {
				$app->sendRequest( 'MiniEditor', 'loadAssets', [
					'loadStyles' => !ArticleComment::isLoadingOnDemand(),
					'loadOnDemand' => true,
					'loadOnDemandAssets' => [
						'/extensions/wikia/MiniEditor/js/Wall/Wall.Animations.js'
					]
				] );
			}
		}
		return true;
	}
}
