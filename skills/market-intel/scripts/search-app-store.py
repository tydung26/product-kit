#!/usr/bin/env python3
"""App Store crawler via iTunes Search API. Zero external dependencies.
Usage: python3 search-app-store.py "<keywords>" [limit]
Output: JSON CrawlResult to stdout
"""

import json
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone


def safe_fetch(url, timeout=10):
    """Fetch URL with timeout and user-agent header."""
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
    })
    return urllib.request.urlopen(req, timeout=timeout)


def truncate(text, max_len=500):
    return text[:max_len] + "..." if len(text) > max_len else text


def fetch_reviews(track_id):
    """Fetch recent reviews via iTunes RSS feed."""
    reviews = []
    try:
        url = (f"https://itunes.apple.com/rss/customerreviews/"
               f"id={track_id}/sortBy=mostRecent/json")
        resp = safe_fetch(url)
        data = json.loads(resp.read())
        entries = data.get("feed", {}).get("entry", [])
        for entry in entries[:6]:
            content = entry.get("content", {}).get("label", "")
            rating_str = entry.get("im:rating", {}).get("label", "")
            if not content or not rating_str:
                continue
            rating = int(rating_str)
            sentiment = "positive" if rating >= 4 else "negative" if rating <= 2 else "neutral"
            reviews.append({
                "text": truncate(content, 300),
                "rating": rating,
                "sentiment": sentiment,
            })
    except Exception:
        pass
    return reviews


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 search-app-store.py <keywords> [limit]"}))
        sys.exit(1)

    query = sys.argv[1]
    limit = 5
    if len(sys.argv) >= 3:
        try:
            limit = max(1, min(int(sys.argv[2]), 10))
        except ValueError:
            limit = 5

    errors = []
    search_url = (
        f"https://itunes.apple.com/search?"
        f"term={urllib.parse.quote(query)}&entity=software&limit={limit}&country=us"
    )

    try:
        resp = safe_fetch(search_url)
        search_data = json.loads(resp.read())
    except Exception as e:
        print(json.dumps({
            "platform": "app_store", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": [f"iTunes API error: {e}"],
        }, indent=2))
        return

    results = []
    for app in search_data.get("results", []):
        track_id = app.get("trackId", 0)
        reviews = fetch_reviews(track_id)
        price = app.get("price", 0)

        results.append({
            "name": app.get("trackName", ""),
            "url": app.get("trackViewUrl", ""),
            "description": truncate(app.get("description", "")),
            "tagline": None,
            "rating": round(app.get("averageUserRating", 0), 1) or None,
            "reviewCount": app.get("userRatingCount"),
            "pricing": {
                "free": price == 0,
                "monthly": None,
                "yearly": None,
                "other": app.get("formattedPrice") if price > 0 else None,
            },
            "features": [],
            "reviews": reviews,
        })

    print(json.dumps({
        "platform": "app_store",
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "errors": errors,
    }, indent=2))


if __name__ == "__main__":
    main()
