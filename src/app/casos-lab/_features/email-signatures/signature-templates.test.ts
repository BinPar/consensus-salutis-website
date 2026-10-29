import { describe, expect, it } from "vitest";
import {
  contactRows,
  renderSignature,
  renderSignatureText,
} from "./signature-templates";

const data = {
  firstName: "Ana <Prueba>",
  lastName: "Co",
  role: "Producto",
  email: "ana@binpar.com",
  phone: "+34 600 000 000",
  photo: "ana-prueba",
};

describe("Noche email signature", () => {
  it("is HTML with live text that email clients preserve", () => {
    const html = renderSignature(data, "https://binpar.com");
    expect(html).not.toMatch(/<style|<svg|class=|display:\s*(flex|grid)|var\(/);
    expect(html).toContain("Ana &lt;Prueba&gt; Co");
    expect(html).toContain(">Producto<");
    expect(html).toContain(">ana@binpar.com</a>");
    expect(html).toContain('href="tel:+34600000000"');
  });

  it("uses the team photo and falls back to the tile", () => {
    expect(renderSignature(data, "https://binpar.com")).toContain(
      'src="https://binpar.com/images/team/ana-prueba.jpg"',
    );
    const without = renderSignature({ ...data, photo: undefined });
    expect(without).not.toContain("/images/team/");
    expect(without).toContain("tile-dark@3x.png");
  });

  it("keeps every image at its exact size", () => {
    for (const [img] of renderSignature(data).matchAll(/<img[^>]*>/g))
      expect(img).toMatch(
        /width="(\d+)" height="(\d+)"[^>]*width:\1px;min-width:\1px;max-width:none;height:\2px;/,
      );
  });

  it("fills the width and gives every detail an icon", () => {
    const html = renderSignature(data);
    expect(html).toMatch(/^<table[^>]*style="[^"]*width:100%;/);
    for (const icon of ["mail", "phone", "map-pin", "globe"])
      expect(html).toContain(`icon-${icon}-turquoise@3x.png`);
    expect(contactRows({ ...data, phone: " " }).map((row) => row.icon)).toEqual(
      ["mail", "map-pin", "globe"],
    );
  });

  it("ends with the official legal notice", () => {
    const html = renderSignature(data);
    expect(html).toContain("ADVERTENCIA | La información contenida");
    expect(html).toContain('href="mailto:Isabel@binpar.com"');
    expect(renderSignatureText(data).split("\n")[0]).toBe("Ana <Prueba> Co");
  });
});
