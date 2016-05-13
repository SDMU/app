/* jshint ignore:start */ define( 'communitypage.templates.mustache', [], function() { 'use strict'; return {
    "CommunityPageSpecial_index" : '{{>pageHeader}}<div class="WikiaMainContent CommunityPageMainContent" id="WikiaMainContent"><div class="WikiaMainContentContainer" id="WikiaMainContentContainer">{{#userIsMember}}<p>Current User is a Member of this Wiki</p>{{/userIsMember}}{{^userIsMember}}<p>Current User is not a member or is Anon</p>{{/userIsMember}}</div><div id="WikiaRail" class="WikiaRail">{{>contributorsModule}}{{>recentActivityModule}}</div></div>',"allAdmins" : '<h2>{{allMembersHeaderText}}</h2><ul class="reset top-contributors">{{#allAdminsList}}<li class="community-page-contributor"><div class="avatar-container"><a data-tracking="all-admins-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div><div class="community-page-contributor-details"><span class="community-page-details">{{contributionsText}}</span><a data-tracking="all-admins-user" href="{{profilePage}}">{{userName}}</a>{{#isAdmin}}<span class="community-page-subtle">{{admin}}</span>{{/isAdmin}}</div></li>{{/allAdminsList}}{{^allAdminsList}}<div class="community-page-zero">{{noAdminText}}<a href="{{noAdminHref}}">{{noAdminContactText}}</a></div>{{/allAdminsList}}</ul>',"allMembers" : '<h2>{{allMembersHeaderText}}</h2><ul class="reset top-contributors">{{#members}}<li class="community-page-contributor"><div class="avatar-container"><a data-tracking="all-members-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div><div class="community-page-contributor-details"><span class="community-page-details">{{joinedText}} {{joinDate}}</span><a data-tracking="all-members-user" href="{{profilePage}}">{{userName}}</a>{{#isAdmin}}<span class="community-page-subtle">{{admin}}</span>{{/isAdmin}}</div></li>{{/members}}{{^members}}<div class="community-page-zero">{{noMembersText}}</div>{{/members}}</ul>',"contributorsModule" : '<div class="module ContributorsModule">{{#topContributors}}{{>topContributors}}{{/topContributors}}{{#topAdminsData}}{{>topAdmins}}{{/topAdminsData}}{{#recentlyJoined}}{{>recentlyJoined}}{{/recentlyJoined}}</div>',"loadingError" : '<div>{{loadingError}}</div>',"modalHeader" : '<ul class="reset modal-nav"><li class="modal-nav-all"><a data-tracking="modal-tab-all" id="modalTabAll" href="#">{{allText}} <span id="allCount">{{allMembersCount}}</span></a></li><li class="modal-nav-admins"><a data-tracking="modal-tab-admins" id="modalTabAdmins" href="#">{{adminsText}} <span id="allAdminsCount">{{allAdminsCount}}</span></a></li><li class="modal-nav-leaderboard"><a data-tracking="modal-tab-leaderboard" id="modalTabLeaderboard" href="#">{{leaderboardText}}</a></li></ul>',"modalLoadingScreen" : '<div class="throbber-placeholder"></div>',"pageHeader" : '<div class="community-page-header" {{#heroImageUrl}}style="background-image: url({{heroImageUrl}});"{{/heroImageUrl}}><div class="community-page-header-content"><h1>{{headerWelcomeMsg}}</h1><p><a href="#" class="signup-button">{{inviteFriendsText}}</a></p></div></div><div class="community-page-admin-welcome-message"><p class="community-page-admin-welcome-message-text">{{adminWelcomeMsg}}</p></div>',"recentActivityModule" : '{{#recentActivityModule}}<div class="module RecentActivityModule"><h2 class="activity-heading">{{activityHeading}}</h2><ul class="reset recent-changes">{{#activity}}<li><div class="avatar-container"><a href="{{profilePage}}">{{{userAvatar}}}</a></div><div class="change-message">{{{changeMessage}}}</div>{{#timeAgo}}<div class="community-page-subtle">{{timeAgo}}</div>{{/timeAgo}}</li>{{/activity}}</ul><a href="{{moreActivityLink}}">{{moreActivityText}}</a></div>{{/recentActivityModule}}',"recentlyJoined" : '<div class="community-page-recently-joined">{{#haveNewMembers}}<div class="members"><h2>{{recentlyJoinedHeaderText}}</h2>{{#members}}<div class="avatar-container"><a data-tracking="recently-joined-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div>{{/members}}</div>{{/haveNewMembers}}<span class="more-link"><a data-tracking="show-modal-all" href="#" id="viewAllMembers">{{allMembers}}</a></span></div>',"topAdmins" : '<div class="top-admins"><h2>{{topAdminsHeaderText}}</h2><ul class="reset">{{#topAdminsList}}<li class="community-page-contributor"><div class="avatar-container"><a data-tracking="top-admins-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div><div class="community-page-contributor-details"><a data-tracking="top-admins-user" href="{{profilePage}}">{{userName}}</a></div></li>{{/topAdminsList}}{{^topAdminsList}}<div class="community-page-zero">{{noAdminText}}<a href="{{noAdminHref}}">{{noAdminContactText}}</a></div>{{/topAdminsList}}</ul>{{#haveOtherAdmins}}<div class="community-page-contributor" id="openModalTopAdmins"><div class="avatar-container avatar-more">+{{otherAdminsCount}}</div><div class="community-page-contributor-details"><a href="">{{otherAdmins}}</a></div></div>{{/haveOtherAdmins}}</div>',"topContributors" : '<h2>{{topContribsHeaderText}}</h2><div class="user-details"><div class="avatar-container">{{{userAvatar}}}</div><div class="community-page-rank"><span>{{userRank}} <small>/ {{weeklyEditorCount}}</small></span><span class="community-page-subtle">{{yourRankText}}</span></div><div class="user-contrib-count"><span>{{userContribCount}}</span><span class="community-page-subtle">{{userContributionsText}}</span></div></div><ul class="reset top-contributors">{{#contributors}}<li class="community-page-contributor"><div class="avatar-container"><a data-tracking="top-contributors-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div><div class="community-page-contributor-details">{{count}}. <a data-tracking="top-contributors-user" href="{{profilePage}}">{{userName}}</a><span class="community-page-subtle">{{contributionsText}}</span></div></li>{{/contributors}}{{^contributors}}<div class="community-page-zero">{{noContribsText}}</div>{{/contributors}}</ul>',"topContributorsModal" : '<h2>{{topContribsHeaderText}}</h2><div class="user-details"><div class="avatar-container">{{{userAvatar}}}</div><div class="community-page-rank"><span>{{userRank}} <small>/ {{weeklyEditorCount}}</small></span><span class="community-page-subtle">{{yourRankText}}</span></div><div class="user-contrib-count"><span>{{userContribCount}}</span><span class="community-page-subtle">{{userContributionsText}}</span></div></div><ul class="reset top-contributors">{{#contributors}}<li class="community-page-contributor"><div class="avatar-container"><a data-tracking="top-contributors-user-avatar" href="{{profilePage}}">{{{avatar}}}</a></div><div class="community-page-contributor-details"><span class="community-page-details">{{contributionsText}}</span>{{count}}. <a data-tracking="top-contributors-user" href="{{profilePage}}">{{userName}}</a>{{#isAdmin}}<span class="community-page-subtle">{{admin}}</span>{{/isAdmin}}</div></li>{{/contributors}}{{^contributors}}<div class="community-page-zero">{{noContribsText}}</div>{{/contributors}}</ul>',
    "done": "true"
  }; }); /* jshint ignore:end */