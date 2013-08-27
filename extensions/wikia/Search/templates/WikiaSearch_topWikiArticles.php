<?php $counter = 0; ?>
<?php if ( !empty( $pages ) ) : ?>
<div class="top-wiki-articles RailModule">
    <h1 class="top-wiki-main"><?= wfMessage( 'wikiasearch2-top-module-title' )->plain() ?></h1>
    <?php foreach ( $pages as $page ) : ?>
    <?php if ( !empty( $page["thumbnailSize"] ) && $page["thumbnailSize"] === "large" ): ?>
    <div class="top-wiki-article hot-article result">
        <div class="top-wiki-article-thumbnail" data-pos="<?= $counter ?>">
            <? if ( isset( $page['thumbnail'] ) ) : ?>
            <a href="<?=$page['url']?>">
                <img src="<?= $page['thumbnail'] ?>" />
            </a>
            <? endif; ?>
        </div>
        <div class="top-wiki-article-text" data-pos="<?= $counter ?>">
            <b><a href="<?= $page['url'] ?>"><?= $page['title'] ?></a></b><!-- comment to remove whitespace
            --><span class="top-wiki-article-text-synopsis subtle"><?= $page['abstract'] ?></span>
        </div>
    </div>
    <?php else: ?>
    <div class="top-wiki-article result">
        <div class="top-wiki-article-thumbnail" data-pos="<?= $counter ?>">
            <? if ( isset( $page['thumbnail'] ) ) : ?>
            <a href="<?=$page['url']?>">
                <img src="<?= $page['thumbnail'] ?>" />
            </a>
            <? endif; ?>
        </div>
        <div class="top-wiki-article-text" data-pos="<?= $counter ?>">
            <b><a href="<?= $page['url'] ?>"><?= $page['title'] ?></a></b><!-- comment to remove whitespace
	        --><span class="top-wiki-article-text-synopsis subtle"><?= $page['abstract'] ?></span>
        </div>
    </div>
    <?php endif; ?>
    <?php if ( $counter++ >= 6 ) { break; } ?>
    <?php endforeach; ?>
</div>
<?php endif; ?>
