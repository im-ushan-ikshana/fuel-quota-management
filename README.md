Fuel Quota Management System
============================

This project manages fuel quotas during a crisis. It lets vehicle owners register, validates their vehicle details against a mock Department of Motor Traffic database, and generates a unique QR code for each vehicle. Fuel station operators use a mobile app to scan the QR code, check the available fuel quota, and record fuel dispensing. After each fueling, a notification (via SMS using Twilio or via email with Mailgun) is sent to the vehicle owner.

Tech Stack:
• Backend: Node.js with Express  
• Frontend: Next.js with React  
• Mobile: Flutter  
• Database: MySQL
• Authentication: JWT  

License: MIT License

For more details on setup and configuration, please refer to the project documentation.