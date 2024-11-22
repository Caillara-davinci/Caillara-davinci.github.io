class Tienda {
    constructor() {
        this.productos = [];
        this.productosFiltrados = [];
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.categoriaActual = 'Todos';
        this.cargarCatalogo();
        this.actualizarCarrito();
    }

    // Cargar productos desde JSON
    cargarCatalogo() {
        fetch('/productos.json')
            .then(response => response.json())
            .then(producto => {
                this.productos = producto;
                this.productosFiltrados = producto; // Inicialmente todos los productos están sin filtrar
                this.renderizarProductos();
            })
            .catch(error => console.error('Error al cargar el catálogo:', error));
    }

    // Método para renderizar productos según la categoría activa
    renderizarProductos(categoria = this.categoriaActual) {
        this.categoriaActual = categoria; // Actualizamos la categoría actual
        const productosDiv = document.getElementById('productos');
        productosDiv.textContent = ''; // Limpia el contenido del contenedor

        // Filtrar productos según la categoría
        this.productosFiltrados = this.productos.filter(producto =>
            categoria === 'Todos' || producto.categoria === categoria
        );

        // Ordenar los productos filtrados si hay un criterio seleccionado
        const select = document.getElementById('sortPrice');
        if (select) {
            const orden = select.value;
            if (orden === 'asc') {
                this.productosFiltrados.sort((a, b) => a.precio - b.precio);
            } else if (orden === 'desc') {
                this.productosFiltrados.sort((a, b) => b.precio - a.precio);
            }
        }

        // Mostrar productos filtrados y ordenados
        this.productosFiltrados.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.className = 'productCard';

            const img = document.createElement('img');
            img.src = producto.imagen;
            img.alt = producto.nombre;

            const detailsDiv = document.createElement('div');

            const h3 = document.createElement('h3');
            h3.textContent = producto.nombre;

            const price = document.createElement('p');
            price.className = 'price';
            price.textContent = `$${producto.precio}`;

            const button = document.createElement('button');
            button.textContent = 'Ver Detalle';
            button.onclick = () => this.verDetalle(producto.id);

            detailsDiv.appendChild(h3);
            detailsDiv.appendChild(price);
            detailsDiv.appendChild(button);

            productCard.appendChild(img);
            productCard.appendChild(detailsDiv);

            productosDiv.appendChild(productCard);
        });
    }

    // Función para ordenar los productos por precio
    ordenarPorPrecio() {
        const select = document.getElementById('sortPrice');
        const orden = select.value;

        // Verificar si hay productos filtrados para ordenar
        if (this.productosFiltrados.length === 0) {
            console.warn("No hay productos para ordenar.");
            return;
        }

        // Ordenar los productos por precio según la opción seleccionada
        if (orden === 'asc') {
            this.productosFiltrados.sort((a, b) => a.precio - b.precio); // Ascendente
        } else {
            this.productosFiltrados.sort((a, b) => b.precio - a.precio); // Descendente
        }

        // Volver a renderizar los productos con el nuevo orden
        this.renderizarProductos(this.categoriaActual);
    }

    verDetalle(id) {
        const producto = this.productos.find(p => p.id === id);
        const productDetail = document.getElementById('productDetail');
        productDetail.textContent = '';

        const img = document.createElement('img');
        img.src = producto.imagen;
        img.alt = producto.nombre;

        const h3 = document.createElement('h3');
        h3.textContent = producto.nombre;

        const desc = document.createElement('p');
        desc.textContent = producto.descripcion;

        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = `$${producto.precio}`;

        const button = document.createElement('button');
        button.textContent = 'Agregar al Carrito';
        button.onclick = () => this.agregarAlCarrito(producto.id);

        productDetail.appendChild(img);
        productDetail.appendChild(h3);
        productDetail.appendChild(desc);
        productDetail.appendChild(price);
        productDetail.appendChild(button);

        document.getElementById('productModal').showModal();
    }

    mostrarCarrito() {
        const cartDetail = document.getElementById('cartDetail');
        cartDetail.textContent = ''; // Limpia el contenido del carrito

        this.carrito.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'cartItem';

            const contentProductCart = document.createElement('div');
            contentProductCart.className = 'contentProductCart';

            const img = document.createElement('img');
            img.src = producto.imagen;
            img.alt = producto.nombre;
            img.className = 'cartImg';

            const boxTextItems = document.createElement('div');
            boxTextItems.className = 'boxTextItems';

            const h3 = document.createElement('h3');
            h3.textContent = producto.nombre;

            const cantidad = document.createElement('p');
            cantidad.textContent = `Cantidad: ${producto.cantidad}`;

            const total = document.createElement('p');
            total.textContent = `Subtotal: $${producto.precio * producto.cantidad}`;

            const boxMinusPlus = document.createElement('div');
            boxMinusPlus.className = 'boxMinusPlus';

            const btnMinus = document.createElement('span');
            btnMinus.textContent = '-';
            btnMinus.onclick = () => this.cambiarCantidadProducto(producto.id, -1);

            const btnPlus = document.createElement('span');
            btnPlus.textContent = '+';
            btnPlus.onclick = () => this.cambiarCantidadProducto(producto.id, 1);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.className = 'btnEliminar';
            btnEliminar.onclick = () => this.quitarDelCarrito(producto.id);

            item.appendChild(img);
            item.appendChild(contentProductCart);
            contentProductCart.appendChild(boxMinusPlus);
            contentProductCart.appendChild(boxTextItems);

            boxTextItems.appendChild(h3);
            boxTextItems.appendChild(cantidad);
            boxTextItems.appendChild(total);
            boxMinusPlus.appendChild(btnMinus);
            boxMinusPlus.appendChild(btnPlus);
            boxMinusPlus.appendChild(btnEliminar);

            cartDetail.appendChild(item);
        });

        const totalPrecioCart = document.getElementById('totalCarrito');
        const botonVaciarCart = document.getElementById('botonVaciarCarrito');
        if (this.carrito.length > 0) {
            totalPrecioCart.textContent = `Total: $${this.calcularTotal()}`;
            botonVaciarCart.style.display = 'block';
        } else {
            totalPrecioCart.textContent = `Carrito vacío`;
            botonVaciarCart.style.display = 'none';
        }

        this.actualizarCarrito();
        document.getElementById('cartModal').showModal();
    }

    cerrarModal(modalId) {
        document.getElementById(modalId).close();
    }

    agregarAlCarrito(id) {
        const producto = this.productos.find(p => p.id === id);
        const productoEnCarrito = this.carrito.find(p => p.id === id);

        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            this.carrito.push({ ...producto, cantidad: 1 });
        }

        this.actualizarCarrito();
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    cambiarCantidadProducto(id, cantidad) {
        const producto = this.carrito.find(p => p.id === id);

        if (producto) {
            producto.cantidad += cantidad;

            if (producto.cantidad <= 0) {
                this.quitarDelCarrito(id);
            } else {
                localStorage.setItem('carrito', JSON.stringify(this.carrito));
            }
        }

        this.mostrarCarrito();
    }

    quitarDelCarrito(id) {
        this.carrito = this.carrito.filter(producto => producto.id !== id);
        this.mostrarCarrito();
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    vaciarCarrito() {
        this.carrito = [];
        this.actualizarCarrito();
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    calcularTotal() {
        return this.carrito.reduce((sum, prod) => sum + prod.precio * prod.cantidad, 0);
    }

    actualizarCarrito() {
        document.getElementById('cartCount').textContent = this.carrito.reduce((sum, prod) => sum + prod.cantidad, 0);
        document.getElementById('totalMonto').textContent = `$${this.calcularTotal()}`;
    }
}

const tienda = new Tienda();
