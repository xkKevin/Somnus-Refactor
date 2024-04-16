SELECT TRIM(product_name) AS product, round(total_amount, 1) AS total_amount
FROM (
    SELECT product_name, amount1 + amount2 AS total_amount
    FROM orders
    WHERE order_date >= '2024-01-01'
) AS subquery
WHERE total_amount > 200
ORDER BY total_amount DESC;
