/**
 * Client-Side JavaScript Enhancements
 */
document.addEventListener("DOMContentLoaded", () => {
    // Auto-dismiss standard info/success alerts after 6 seconds
    const alerts = document.querySelectorAll(".alert-success, .alert-info");
    alerts.forEach((alert) => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 6000);
    });

    // Form submission double-click prevention
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn && !submitBtn.disabled) {
                // Add loading indicator
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...`;
                // Keep enabled for native form submit to proceed, but prevent multi-clicks
                setTimeout(() => {
                    submitBtn.classList.add("disabled");
                }, 50);
            }
        });
    });
});
