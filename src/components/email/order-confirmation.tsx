interface OrderConfirmationEmailProps {
    customerName: string;
    orderId: string;
    total: string;
    items: { name: string; quantity: number; price: string }[];
}

export const OrderConfirmationEmail: React.FC<Readonly<OrderConfirmationEmailProps>> = ({
    customerName,
    orderId,
    total,
    items,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1 style={{ color: '#d4a5a5' }}>Pedido Confirmado!</h1>
        <p>Olá, <strong>{customerName}</strong>!</p>
        <p>Recebemos seu pedido com muito amor. Abaixo estão os detalhes:</p>

        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
            <p><strong>Pedido:</strong> #{orderId}</p>
            <ul>
                {items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                        {item.quantity}x {item.name} - <strong>{item.price}</strong>
                    </li>
                ))}
            </ul>
            <hr style={{ border: '1px solid #ddd' }} />
            <p style={{ fontSize: '18px' }}><strong>Total: {total}</strong></p>
        </div>

        <p>Em breve entraremos em contato com atualizações sobre o envio.</p>
        <p>Com carinho,<br />Equipe Danis Para Bebê</p>
    </div>
);
