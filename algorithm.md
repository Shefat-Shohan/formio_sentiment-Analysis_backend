Ai sentiment analysys algorithm.

(A) Fetch & Analyze Feedback (Worker 1)

1. First pull all new feedback (statue =0)
2. Then Lock Feedback for processing (status=1)
3. Analyze Feedback with AI
4. Store Ai response in aiSentiment Table
5. Mark process Feedback as Analyze complete (statue=2)

(B) Merging Feedback (Worker 2)

6. Check for Analyze Feedback for same formRef in aiSentiment
7. Lock Feedback for merging (status =1)
8. Merge Sentiment Data (Aggregate all formRef result together).
9. Save merged data
10. Mark feedback as completed (statue=2)
