// utils/verifyEmailTemplate.js

const verifyEmailTemplate = ({ name, url }) => {
    return `
        <p>Dear ${name},</p>
        <p>Thank you for registering with Blinkiit.</p>
        <a 
            href="${url}" 
            style="
                color: white; 
                background: blue; 
                margin-top: 10px; 
                padding: 8px 12px; 
                display: inline-block; 
                text-decoration: none;
                border-radius: 4px;
            "
        >
            Verify Email
        </a>
    `;
};

export default verifyEmailTemplate;
