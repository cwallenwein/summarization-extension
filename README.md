# Summarization Extension

Functionality:
- Click icon -> popup opens
- chrome.storage.local is used to store all summaries and corresponding urls
- When "Summarize selected text" is clicked:
    1. message from popup to worker is sent to summarize selection
    2. popup adds card with state loading to the feed
    3. worker gets selected text
    4. worker sends a request to the summarization api
    5. result is stored in chrome.storage
    6. popup listens to chrome.storage events and updates/displays feed accordingly


Popup-Design:
- Designed with ant.design
- On top there is a button named "Summarize selected text"
- Below is a feed of all summaries (newest first)
- Each summary is a ant.design card
    - Header: Website URL
    - Body: Summary
    - Footer: Link to page, copy summary
- Button to delete history of all summaries