import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ExportItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

export async function exportListAsHtml(
  listName: string,
  items: ExportItem[],
  total: number
): Promise<string> {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">R$ ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
        h1 { color: #7e22ce; border-bottom: 2px solid #7e22ce; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #7e22ce; color: white; padding: 10px 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; color: #7e22ce; }
        .footer { margin-top: 32px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(listName)}</h1>
      <table>
        <tr><th>Produto</th><th>Qtd</th><th>Valor</th></tr>
        ${itemsHtml}
      </table>
      <div class="total">Total: R$ ${total.toFixed(2)}</div>
      <div class="footer">Gerado pelo Marketlist</div>
    </body>
    </html>
  `;

  const fileName = `${listName.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, html);
  return filePath;
}

export async function shareFile(filePath: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: "text/html",
      dialogTitle: "Compartilhar lista de compras",
    });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
