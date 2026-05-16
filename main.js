 document.addEventListener('DOMContentLoaded', () => {
            
            // 1. Inicializar base de datos en localStorage si no existe
            if (!localStorage.getItem('luxestay_users')) {
                const defaultUsers = [
                    { username: 'admin1', password: 'adminPrueba', role: 'admin', name: 'Administrador Bryan' }
                ];
                localStorage.setItem('luxestay_users', JSON.stringify(defaultUsers));
            }

            

            // 2. Comprobar si ya está logueado para redirigir directamente al dashboard
            if (localStorage.getItem('isAuthenticated') === 'true') {
                window.location.href = 'pages/dashboard.html';
            }

            // 3. Elementos del DOM
            const loginForm = document.getElementById('loginForm');
            const errorAlert = document.getElementById('errorAlert');
            const submitBtn = document.getElementById('submitBtn');

            // 4. Manejo del formulario
            if(loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault(); // Evita recargar la página

                    const userVal = document.getElementById('username').value.trim();
                    const passVal = document.getElementById('password').value.trim();

                    // Obtener usuarios del localStorage
                    const users = JSON.parse(localStorage.getItem('luxestay_users')) || [];

                    // Validar credenciales
                    const userFound = users.find(u => u.username === userVal && u.password === passVal);

                    if (userFound) {
                        // Éxito: Guardar sesión
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('currentUser', JSON.stringify(userFound));
                        
                        // Efecto visual de carga
                        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">refresh</span> Ingresando...';
                        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
                        
                        // Redirigir al dashboard simulando una pequeña carga
                        setTimeout(() => {
                            window.location.href = 'pages/dashboard.html';
                        }, 600);

                    } else {
                        // Fallo: Mostrar error
                        errorAlert.classList.remove('hidden');
                        
                        // Limpiar contraseña
                        document.getElementById('password').value = '';
                    }
                });
            }

            // 5. Ocultar alerta de error al escribir de nuevo
            const inputs = document.querySelectorAll('#loginForm input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    if(!errorAlert.classList.contains('hidden')){
                        errorAlert.classList.add('hidden');
                    }
                });
            });
        });