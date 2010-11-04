<div id='profile-content'>
	<div class="user-about-section" data-generic-avatar="<?= $extensionsPath ;?>/wikia/UserProfilePage/img/mic.jpg" data-user-avatar="<?= AvatarService::getAvatarUrl( $userName, 22 ) ;?>">
		<h2>
			<? $sectionName = wfMsg( 'userprofilepage-about-section-title', array( $wikiName ) ) ;?>
			<?= $sectionName ;?>
			<span class="editsection">
				<a rel="nofollow" href="<?= $aboutSection['articleEditUrl']; ?>">
					<img class="sprite edit-pencil" src="<?= wfBlankImgUrl() ;?>" section="" rel="nofollow" alt="<?= wfMsg( 'userprofilepage-edit-button' ); ?>">
				</a>
				<a rel="nofollow" href="<?= $aboutSection['articleEditUrl']; ?>"><?= wfMsg( 'userprofilepage-edit-button' ); ?></a>
			</span>
		</h2>
		<?= $aboutSection['body']; ?>
	</div>

	<div class="user-notes-section">
		<h2>
			<? $sectionName = wfMsg( 'userprofilepage-users-notes-title' ) ;?>
			<?= $sectionName ;?>
			<span class="editsection">
				<a rel="nofollow" href="<?=$userPageUrl;?>?action=edit">
					<img class="sprite edit-pencil" src="<?= wfBlankImgUrl() ;?>" section="" rel="nofollow" alt="<?= wfMsg( 'userprofilepage-edit-button' ); ?>">
				</a>
				<a rel="nofollow" href="<?=$userPageUrl;?>?action=edit"><?= wfMsg( 'userprofilepage-edit-button' ); ?></a>
			</span>
		</h2>
		<?=$pageBody;?>
	</div>
</div>