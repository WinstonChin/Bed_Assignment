async function login(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  function createWowToast(message) {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div class="toast-content">
        <svg class="checkmark" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14 27l10 10 14-18"/>
        </svg>
        <span>${message}</span>
      </div>
    `;

    Object.assign(toast.style, {
      position: 'fixed',
      top: '-100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(15px)',
      borderRadius: '20px',
      boxShadow: '0 8px 24px rgba(111, 66, 193, 0.5)',
      color: '#5b2f91',
      fontFamily: "'Quicksand', sans-serif",
      fontWeight: '700',
      fontSize: '18px',
      padding: '20px 28px',
      maxWidth: '90vw',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      opacity: '0',
      zIndex: '99999',
      userSelect: 'none',
      cursor: 'default',
      transition: 'opacity 0.4s ease, top 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    });

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-content {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          width: 100%;
        }
        .checkmark {
          width: 32px;
          height: 32px;
          stroke: #7a56d4;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          animation: drawCircle 0.6s ease forwards, drawCheck 0.3s ease 0.6s forwards;
        }
        .checkmark-circle {
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
        }
        .checkmark-check {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
        }
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px 2px rgba(160, 120, 255, 0.6);
          }
          50% {
            box-shadow: 0 0 18px 4px rgba(160, 120, 255, 0.9);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.top = '30px';
      toast.style.opacity = '1';
      toast.style.animation = 'pulseGlow 2s ease-in-out infinite';
    }, 50);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.top = '-100px';
      toast.style.animation = '';
      toast.addEventListener('transitionend', () => toast.remove());
    }, 1000);
  }

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      createWowToast("Login successful!");

      localStorage.setItem("userId", data.userId);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("userProfilePic", data.profilePicUrl || "");
      localStorage.setItem('token', data.token);

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1100);
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong.");
  }
}
