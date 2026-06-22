// Phone mask for Russian phone number input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');

    // Function to format phone number
    function formatPhone(value) {
        // Remove all non-digit characters
        let digits = value.replace(/\D/g, '');

        // Limit to 11 digits (including +7)
        if (digits.length > 11) {
            digits = digits.slice(0, 11);
        }

        // Build the formatted string
        let formatted = '+7 ';
        if (digits.length > 1) {
            formatted += '(' + digits.slice(1, 4);
        }
        if (digits.length >= 5) {
            formatted += ') ' + digits.slice(4, 7);
        }
        if (digits.length >= 8) {
            formatted += '-' + digits.slice(7, 9);
        }
        if (digits.length >= 10) {
            formatted += '-' + digits.slice(9, 11);
        }

        return formatted;
    }

    // Function to validate phone
    function validatePhone(value) {
        const regex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        return regex.test(value);
    }

    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value;

        // Allow only digits, +, (, ), -, space
        value = value.replace(/[^+\d\(\)\-\s]/g, '');

        // Format the value
        const formatted = formatPhone(value);

        // Set the formatted value
        e.target.value = formatted;

        // Check if complete and valid
        if (formatted.length === 18 && validatePhone(formatted)) {
            phoneError.style.display = 'none';
        } else if (formatted.length > 0) {
            phoneError.style.display = 'block';
        } else {
            phoneError.style.display = 'none';
        }
    });

    // On blur, check final validation
    phoneInput.addEventListener('blur', function() {
        const value = phoneInput.value;
        if (value && !validatePhone(value)) {
            phoneError.style.display = 'block';
        }
    });
});