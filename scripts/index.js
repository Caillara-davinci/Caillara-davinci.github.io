class Tienda {
    constructor() {
        this.productos = [];
        this.productosFiltrados = [];
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.categoriaActual = 'Todos';
        this.cargarCatalogo();
        this.actualizarCarrito();

        this.banners = [
            'https://i.pinimg.com/736x/06/48/1f/06481fbdf0a5294a010e303338276240.jpg', // URL o ruta de imagen 1
            'https://i.pinimg.com/736x/7f/d6/16/7fd61637f82fa579cc07f3353fcef339.jpg', // URL o ruta de imagen 2
            'https://i.pinimg.com/736x/55/18/e5/5518e58919683f48ec0e65b12c7ed56a.jpg'  // URL o ruta de imagen 3
        ];
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

    // Método para mostrar un banner aleatorio
    mostrarBannerPublicidad() {
        // Crear el fondo negro (overlay)
        const overlay = document.createElement('div');
        overlay.id = 'bannerOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);

        // Crear el contenedor del banner
        const banner = document.createElement('div');
        banner.id = 'bannerPublicidad';
        banner.style.position = 'fixed';
        banner.style.top = '10%';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.zIndex = '1000';
        banner.style.backgroundColor = '#fff';
        banner.style.border = '1px solid #ddd';
        banner.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        banner.style.padding = '16px';
        banner.style.textAlign = 'center';

        // Seleccionar una imagen aleatoria
        const randomImage = this.banners[Math.floor(Math.random() * this.banners.length)];
        const img = document.createElement('img');
        img.src = randomImage;
        img.alt = 'Oferta Publicitaria';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.marginBottom = '8px';

        // Botón para cerrar el banner
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '4px';
        closeButton.style.right = '4px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '50%';
        closeButton.style.width = '24px';
        closeButton.style.height = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            document.body.removeChild(banner);
            document.body.removeChild(overlay); // Quitar el overlay
        };

        banner.appendChild(img);
        banner.appendChild(closeButton);
        document.body.appendChild(banner);

        // Eliminar automáticamente el banner después de 10 segundos
        setTimeout(() => {
            if (document.body.contains(banner)) {
                document.body.removeChild(banner);
                document.body.removeChild(overlay); // Quitar el overlay
            }
        }, 10000);
    }


    // Método para renderizar productos según la categoría activa
    renderizarProductos(categoria = this.categoriaActual) {
        this.categoriaActual = categoria; // Actualiza la categoría actual
        const productosDiv = document.getElementById('productos');
        productosDiv.textContent = ''; // Limpia el contenido del contenedor

        // Mostrar banner de publicidad
        this.mostrarBannerPublicidad();

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
        const checkoutContainer = document.getElementById('checkoutContainer');

        if (this.carrito.length > 0) {
            totalPrecioCart.textContent = `Total: $${this.calcularTotal()}`;
            botonVaciarCart.style.display = 'block';
            checkoutContainer.style.display = 'block'; // Mostrar el botón de checkout
        } else {
            totalPrecioCart.textContent = `Carrito vacío`;
            botonVaciarCart.style.display = 'none';
            checkoutContainer.style.display = 'none'; // Ocultar el botón de checkout
        }

        this.actualizarCarrito();
        document.getElementById('cartModal').showModal();
    }

    mostrarCheckout() {
        const checkoutModal = document.getElementById('checkoutModal');
        const checkoutForm = document.getElementById('checkoutForm');

        // Limpio el contenido anterior
        checkoutForm.textContent = '';

        const fieldsetCliente = document.createElement('fieldset');

        const camposCliente = [
            { label: 'Nombre', id: 'nombre', type: 'text', required: true },
            { label: 'Teléfono', id: 'telefono', type: 'tel', required: true },
            { label: 'Email', id: 'email', type: 'email', required: true },
            { label: 'Lugar de entrega', id: 'lugarEntrega', type: 'text', required: true },
            { label: 'Fecha de entrega', id: 'fechaEntrega', type: 'date', required: true },
        ];

        camposCliente.forEach(campo => {
            const label = document.createElement('label');
            label.textContent = `${campo.label}: `;
            const input = document.createElement('input');
            input.type = campo.type;
            input.id = campo.id;
            if (campo.required) input.required = true;
            label.appendChild(input);
            fieldsetCliente.appendChild(label);
        });

        const fieldsetPago = document.createElement('fieldset');
        const legendPago = document.createElement('legend');
        legendPago.textContent = 'Información de Pago';
        fieldsetPago.appendChild(legendPago);

        const metodoPagoLabel = document.createElement('label');
        metodoPagoLabel.textContent = 'Método de Pago: ';
        const metodoPagoSelect = document.createElement('select');
        metodoPagoSelect.id = 'metodoPago';
        metodoPagoSelect.required = true;
        ['Tarjeta de Crédito', 'Tarjeta de Débito', 'Efectivo'].forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.toLowerCase().replace(/ /g, '');
            option.textContent = opcion;
            metodoPagoSelect.appendChild(option);
        });
        metodoPagoLabel.appendChild(metodoPagoSelect);
        fieldsetPago.appendChild(metodoPagoLabel);

        const cuotasLabel = document.createElement('label');
        cuotasLabel.textContent = 'Cuotas: ';
        const cuotasInput = document.createElement('input');
        cuotasInput.type = 'number';
        cuotasInput.id = 'cuotas';
        cuotasInput.min = 1;
        cuotasInput.max = 12;
        cuotasLabel.appendChild(cuotasInput);
        fieldsetPago.appendChild(cuotasLabel);

        const finalizarButton = document.createElement('button');
        finalizarButton.type = 'submit';
        finalizarButton.textContent = 'Finalizar Compra';

        const cancelarButton = document.createElement('button');
        cancelarButton.type = 'button';
        cancelarButton.textContent = 'Cancelar';
        cancelarButton.onclick = () => this.cancelarCheckout();

        checkoutForm.appendChild(fieldsetCliente);
        checkoutForm.appendChild(fieldsetPago);
        checkoutForm.appendChild(finalizarButton);
        checkoutForm.appendChild(cancelarButton);

        // Mostrar modal
        checkoutModal.showModal();
    }

    cancelarCheckout() {
        document.getElementById('checkoutModal').close();
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
        this.mostrarCarrito();
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

function toggleMenu() {
    const navCategorias = document.querySelector('.navCategorias');
    navCategorias.classList.toggle('active');
}

document.getElementById('checkoutForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Obtengo los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const lugarEntrega = document.getElementById('lugarEntrega').value;
    const fechaEntrega = document.getElementById('fechaEntrega').value;
    const metodoPago = document.getElementById('metodoPago').value;
    const cuotas = document.getElementById('cuotas').value;

    // Muestro los datos del formulario
    console.log({
        nombre,
        telefono,
        email,
        lugarEntrega,
        fechaEntrega,
        metodoPago,
        cuotas,
    });

    // Mensaje de éxito y cierre del modal
    alert("¡Compra finalizada con éxito!");
    tienda.vaciarCarrito(); // Vacio el carrito después de finalizar la compra
    document.getElementById('checkoutModal').close(); // Cierro el modal
});
