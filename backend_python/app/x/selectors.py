"""
X (Twitter) DOM Selectors.
Isolated locators for public tweets, comments, author info, and engagement metrics.
"""


class XSelectors:
    """CSS and XPath locators for public X DOM structure."""

    # Primary search & containers
    SEARCH_INPUT = 'input[data-testid="SearchBox_Search_Input"], input[placeholder*="Search"]'
    TWEET_ARTICLE = 'div[data-testid="cellInnerFrame"], article, li[role="listitem"]'
    TWEET_TEXT = 'div[data-testid="tweetText"]'

    # Author info
    USER_NAME_CONTAINER = 'div[data-testid="User-Name"]'
    USER_AVATAR = 'div[data-testid*="UserAvatar"] img, img[src*="profile_images"]'

    # Timestamps & links
    TWEET_TIME = 'time'
    TWEET_PERMALINK = 'a[href*="/status/"]'

    # Engagement metrics
    REPLY_BUTTON = 'div[data-testid="reply"]'
    REPOST_BUTTON = 'div[data-testid="retweet"]'
    LIKE_BUTTON = 'div[data-testid="like"]'
    VIEWS_BUTTON = 'a[href*="/analytics"]'

    # Login / Access wall indicators
    LOGIN_WALL = 'div[data-testid="login"], div[data-testid="sheetDialog"], a[href*="/login"]'
    ACCESS_DENIED = 'div[data-testid="emptyState"]'
