<?php

require_once( __DIR__ . '/../Maintenance.php' );

class DeleteImageRevision extends Maintenance {

	const PAGE_ID_OPTION = 'pageId';
	const REVISION_ID_OPTION = 'revisionId';
	const REASON_OPTION = 'reason';

	public function __construct() {
		parent::__construct();
		$this->addOption( self::PAGE_ID_OPTION, "image page id", true );
		$this->addOption( self::REVISION_ID_OPTION, "revision id", true );
		$this->addOption( self::REASON_OPTION, "deletion reason", true );
		$this->mDescription = "Remove given revision of given image file";
	}


	public function execute() {
		$pageId = intval( $this->getOption( self::PAGE_ID_OPTION ) );
		$revisionId = intval( $this->getOption( self::REVISION_ID_OPTION ) );
		$reason = $this->getOption( self::REASON_OPTION );

		$title = Title::newFromID( $pageId );

		//TODO: fix it, adding description to imagepage creates new revision so following check will not check if the image is old
		if ( $revisionId < $title->getLatestRevID() ) {
			$oldLocalFile = $this->getOldLocalFile( $title, $revisionId );
			$oldLocalFile->deleteOld( $oldLocalFile->getArchiveName(), $reason );
		} else {
			//do the revision revert
			// and then remove second newest revision
		}
	}

	private function getOldLocalFile( Title $title, int $revId ): OldLocalFile {
		$db = wfGetDB( DB_SLAVE );
		$timestamp = $db->selectField(
			[ 'revision' ],
			'rev_timestamp',
			[
				'rev_page' => $title->getArticleID(),
				'rev_id' => $revId,
			],
			__METHOD__
		);

		return OldLocalFile::newFromTitle( $title, RepoGroup::singleton()->getLocalRepo(), $timestamp );
	}
}


$maintClass = "DeleteImageRevision";
require_once( RUN_MAINTENANCE_IF_MAIN );