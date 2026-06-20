import { exportListAsHtml } from "../utils/exportList";

const mockItems = [
  { name: "Arroz", quantity: 2, price: 5.5, imageUrl: null },
  { name: "Feijão", quantity: 1, price: 8.0, imageUrl: null },
];

describe("exportListAsHtml", () => {
  it("should generate HTML with list name in h1", async () => {
    const filePath = await exportListAsHtml("Compras Semanais", mockItems, 19.0);
    expect(filePath).toContain("Compras_Semanais.html");
  });

  it("should escape HTML special characters in product names", async () => {
    const items = [
      { name: 'Produto <Teste> & "Cia"', quantity: 1, price: 10, imageUrl: null },
    ];
    const filePath = await exportListAsHtml("Test", items, 10);
    expect(filePath).toContain(".html");
  });
});
