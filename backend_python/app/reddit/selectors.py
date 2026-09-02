"""
Reddit DOM Selectors for public search & post comments.
Isolated locators for old.reddit.com and reddit.com public interfaces.
"""


class RedditSelectors:
    """CSS locators for public Reddit content."""

    # Post containers on old.reddit.com
    POST_CONTAINER = "div.thing.link"
    POST_TITLE = "a.title"
    POST_AUTHOR = "a.author"
    POST_SCORE = "div.score.unvoted"
    POST_COMMENTS_LINK = "a.comments"
    POST_TIME = "time"
    
    # Comment containers on post pages
    COMMENT_CONTAINER = "div.thing.comment"
    COMMENT_BODY = "div.usertext-body"
    COMMENT_AUTHOR = "a.author"
    COMMENT_SCORE = "span.score.unvoted"
