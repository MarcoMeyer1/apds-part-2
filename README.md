# Project Title

## Overview
This project is a secure portal built using Express.js for the API and React for the frontend. It includes robust features to protect against various security threats while ensuring optimal functionality for user registration, login, payments, and transaction tracking.

---

## Security Measures Implemented

To harden the portal against common security threats, we have implemented several approaches to mitigate each type of attack:

### i. Session Jacking
   - **Approach**: Implemented secure, HttpOnly cookies for storing JWT tokens. Additionally, tokens have a short lifespan and are verified on every request.

### ii. Clickjacking
   - **Approach**: Utilized `helmet.frameguard()` middleware to set the `X-Frame-Options` header to 'DENY', which prevents the site from being embedded in iframes, protecting against clickjacking.

### iii. SQL Injection Attacks
   - **Approach**: All database queries are parameterized using the SQL Server library (`mssql`) to avoid concatenating user inputs directly into SQL queries, preventing SQL injection.

### iv. Cross Site Scripting (XSS) Attacks
   - **Approach**: Used `helmet.xssFilter()` to add a layer of XSS protection by setting the proper HTTP headers. All user inputs are validated and sanitized.

### v. Man in the Middle (MitM) Attacks
   - **Approach**: Enforced HTTPS connections by using `helmet.hsts()` with a max age of one year, ensuring communication is encrypted with TLS. Also, sensitive cookies are marked as `Secure` and `SameSite=Strict`.

### vi. DDoS Attacks
   - **Approach**: Implemented `express-rate-limit` to limit the number of requests from a single IP within a set window, protecting the server from DDoS attacks. The window is set to 15 minutes with a maximum of 100 requests.

### vii. Brute Force Attacks
   - **Approach**: Added brute force protection using `express-brute`, limiting the number of login attempts before temporarily blocking further requests.

---

## DevSecOps Practices

As part of our continuous integration and security pipeline, we have integrated **CircleCI** for automated testing and deployment. Additionally, we have integrated **SonarCloud** to run **SonarScanner** in the workflow, analyzing the codebase for security vulnerabilities, bugs, and code quality issues. This is a key aspect of our **DevSecOps** process to ensure secure development practices.

---

## Running the App

To run the project locally, follow these steps:

1. Clone the repository to your local machine.

2. Open two terminals, one for the client (React) and one for the API (Express).

3. In the first terminal, navigate to the **client** folder and run:
    ```bash
    npm install
    npm start
    ```

4. In the second terminal, navigate to the **api** folder and run:
    ```bash
    npm install
    node index.js
    ```

The client will run on `http://localhost:3000` and the API will run on `http://localhost:5000`.

---

## CircleCI Configuration

This project utilizes CircleCI for continuous integration and deployment. CircleCI is configured to run tests, linting, and security scans using **SonarCloud**. The pipeline ensures that any code changes are verified before being merged into the main branch.

---

## SonarCloud Integration

The SonarScanner is configured in the CircleCI pipeline to scan the codebase for code quality and security issues. It provides insights into bugs, security vulnerabilities, code smells, and code duplications. This integration is key to maintaining high code quality throughout the development lifecycle.

---

## License

This project is licensed under the MIT License.
