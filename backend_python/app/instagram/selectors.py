"""
Instagram DOM Selectors.
Isolated locators for Instagram posts, reels, comments, author info, and engagement.
"""


class InstagramSelectors:
    """CSS locators for Instagram web DOM elements."""

    # Post containers on explore/search grid or feed
    POST_CONTAINER = 'article, div._aabd, div._ac7v, a[href*="/p/"], a[href*="/reel/"]'
    FEED_ARTICLE = 'article[role="presentation"], article'

    # Post text / Caption
    POST_CAPTION = 'div._a9zs, span._ap3a, h1._aacl, span'

    # Author info & links
    AUTHOR_HEADER = 'header a[role="link"], a[role="link"], span._aacw'
    POST_PERMALINK = 'a[href*="/p/"], a[href*="/reel/"]'
    TIMESTAMP_ELEMENT = 'time'

    # Comments
    COMMENT_CONTAINER = 'ul._a9ym > div, li._a9zr, div._a9zs'
    COMMENT_TEXT = 'span._ap3a, span'
    COMMENT_AUTHOR = 'a[role="link"], h3 a'

    # Engagement & Reactions
    LIKE_COUNT = 'section span, a[href*="/liked_by/"] span, button span'
    COMMENT_COUNT = 'span'

    # Access / Login wall indicators
    LOGIN_DIALOG = 'form#loginForm, input[name="username"]'
    ACCESS_RESTRICTED = 'div:has-text("Sorry, this page isn\'t available.")'
