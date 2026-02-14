# Software Engineering Project

> Weekly Log - Individual Submission

<br>

| Name         | Team | Student ID |
| ------------ | ---- | ---------- |
| `Nicole Low` | NA   | `2526889A` |

<br>

## Week 4

### 1 - Objectives of the Week (1 mark)

> _(List the key goals or tasks planned for this week)_

1. Transaction - POST
2. Transaction - READ
3. Transaction - Grouping
4. Transaction - Sort Months by Year first then Date
5. Transaction - Transaction Edit button

<br>

### 2 - Activities Completed for the Week (1 mark)

> _(Describe developments done, including methods, tools, and technologies. Please provide screenshots where applicable.)_

- [x] Transaction - POST
- [x] Transaction - READ
- [x] Transaction - Grouping
- [x] Transaction - Sort Months by Year first then Date
- [x] Transaction - Transaction Edit button
- [x] Transaction - Transaction Delete button
- [x] Overview Charts

<br>

### 3 - Challenges Encountered (1 mark)

> _(Mention any difficulties or issues faced and how they were addressed)_

- Challenge 1 - Sending a POST request to the Database
    - Kept getting error for Row-Level security access when I tried creating a new transaction record from the UI.
    - Initially suspected it to be mismatched data structures.
    - Addressed by disabling RLS
    - Diagnosed that the table policy was wrongly implemented.

<br>

### 4 - Reflections (1 mark)

> _(Did you receive any feedback from your teammates, and how did you address or resolve it? Did you manage to complete the tasks you intended to finish this week? What will be your top priority for next week?)_

```
It was interesting to learn how to use Next.js in a project. I learnt how to:
    - Implement Login functions
    - Send CRUD requests to the database via the web application
    - Filter transaction records by year then month
    - Create charts based on the supabase table


Pending Features:
- csv download of transaction records given a specified time period by user input
- Search functon for transaction
- Goals page
- Shop page
```
