export class Navbar {
    static render() {
        const navbarContainer = document.getElementById('navbar');
        if (navbarContainer) {
            navbarContainer.innerHTML = `
                <div class="navbar">
                    <div class="logo">Instagram</div>
                    <div class="nav-icons">
                        <i class="fas fa-home"></i>
                        <i class="fas fa-paper-plane"></i>
                        <i class="fas fa-plus-square"></i>
                        <i class="fas fa-compass"></i>
                        <i class="fas fa-heart"></i>
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;
        }
    }
}