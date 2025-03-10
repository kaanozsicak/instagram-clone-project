export class Navbar {
    static render() {
        const navbarContainer = document.getElementById('navbar');
        if (navbarContainer) {
            navbarContainer.innerHTML = `
                <link rel="stylesheet" href="/styles/theme.css">
                <style>
                    .navbar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 20px;
                        background-color: var(--card-color);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                        border-radius: 12px;
                    }
                    
                    .logo {
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--primary-color);
                    }
                    
                    .nav-icons {
                        display: flex;
                        gap: 20px;
                        align-items: center;
                    }
                    
                    .nav-icon {
                        font-size: 22px;
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                    }
                    
                    .nav-icon:hover {
                        color: var(--primary-color);
                        background-color: rgba(85, 99, 222, 0.1);
                    }
                </style>
                <div class="navbar">
                    <div class="logo">Photogram</div>
                    <div class="nav-icons">
                        <div class="nav-icon">
                            <i class="fas fa-home"></i>
                        </div>
                        <div class="nav-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="nav-icon">
                            <i class="fas fa-plus-square"></i>
                        </div>
                        <div class="nav-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="nav-icon">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}
