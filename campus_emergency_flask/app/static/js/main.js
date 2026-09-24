// Campus Emergency Orchestration System - Client Script
console.log("Campus Emergency AI Orchestration System Initialized.");

// Auto dismiss alerts after 5 seconds
document.addEventListener("DOMContentLoaded", function() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            try {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            } catch (e) {}
        }, 5000);
    });
});
