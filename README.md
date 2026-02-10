# 🚨 ReportNow


![EchoForms](public/HomePage.png)





**ReportNow** is an advanced, AI-powered web application that enables users to **anonymously report incidents** whether emergency or non-emergency seamlessly and efficiently. By simply uploading an image, the system leverages **Gemini LLM** to intelligently analyze the content and automatically generate a **structured incident report**, including the **title, description, and category**. Users have full control to review and refine the generated details before submission.

Beyond reporting, **ReportNow** enhances public safety by offering **real-time report tracking, live location sharing, and instant access to nearby emergency services** such as **hospitals, police stations, fire stations, and pharmacies**. Designed with scalability and security in mind, the application is fully **Dockerized**, ensuring effortless deployment across any environment.
 

---

## 🌟 Key Features

- 📸 **AI-Powered Image Analysis** – Automatically extracts key details from uploaded images to generate a comprehensive incident report.
- 📝 **Smart Report Generation** – Dynamically fills in the report fields with AI-generated insights, editable by the user.
- 📍 **Live Location Sharing** – Users can provide their real-time location for precise assistance.
- 🔎 **Incident Tracking System** – Every report is assigned a **unique tracking ID**, allowing users to monitor real-time status updates.
- ✉️ **Email Notifications** – Optional email alerts keep users informed on their report’s progress.
- 🏥 **Nearby Emergency Support** – Instantly fetches locations of the closest **hospitals, police stations, fire stations, and pharmacies**.
- 🔐 **Admin Dashboard** – Securely managed via **NextAuth**, enabling administrators to oversee and handle reports efficiently.
- ☁️ **Cloud-Based Image Storage** – Seamless integration with **Cloudinary** for secure and scalable image management.
- 🐳 **Dockerized Deployment** – Deploy the entire application effortlessly using a pre-configured **Docker image**.

---

## 🛠️ Tech Stack

| **Technology**  | **Purpose** |
|----------------|------------|
| **Next.js** | Frontend & API Routes |
| **Prisma & PostgreSQL (NeonDB)** | Database & ORM |
| **Gemini LLM** | AI-powered image analysis |
| **NextAuth** | Secure authentication (Admin Dashboard) |
| **Cloudinary** | Scalable image storage |
| **Resend** | Email notification services |
| **React Hook Form & Zod** | Form validation & management |
| **Docker** | Containerized deployment |

---



## 🛡 License

ReportNow is licensed under the MIT License.

---

