"""
Facebook DOM Selectors.
Isolated locators for public Facebook page posts, comments, author info, and visible reactions.
"""


class FacebookSelectors:
    """CSS locators for public Facebook DOM elements."""

    # Post containers — confirmed: div[aria-posinset] = 7 elements on search page
    POST_CONTAINER = 'div[aria-posinset]'
    POST_TEXT = 'div[data-ad-comet-preview="message"], div[data-ad-preview="message"], div[dir="auto"]'

    # Author info & links
    AUTHOR_HEADER = 'h2, h3, strong, a[href*="facebook.com/"]'
    POST_PERMALINK = 'a[href*="/posts/"], a[href*="/permalink/"], a[href*="/photos/"], a[href*="fbid="]'
    TIMESTAMP_ELEMENT = 'abbr, a[href*="/posts/"] span, a[href*="fbid="] span'

    # Visible reactions & engagement
    REACTION_COUNT = 'span[aria-label*="reaction"], span[aria-label*="like"], span[aria-label*="like"]'
    COMMENT_COUNT = 'span:has-text("comment"), span:has-text("Comment")'
    SHARE_COUNT = 'span:has-text("share"), span:has-text("Share")'

    # Login / Access wall indicators
    LOGIN_DIALOG = 'div[id="login_popup_cta"], div[aria-label*="Log In"], a[href*="/login/"]'
    ACCESS_RESTRICTED = 'div[id="error_box"], div[role="main"]:has-text("Content Not Found")'
