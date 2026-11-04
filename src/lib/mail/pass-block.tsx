import { Img, Text } from "@react-email/components";
import { mailBrand } from "./brand";

export function PassBlock() {
  return (
    <>
      <Img src="cid:pase" alt="Pase de acceso" width="220" height="220" style={{ margin: "8px 0 12px" }} />
      <Text style={{ margin: 0, color: mailBrand.navy, fontSize: 14 }}>
        Lleva este código en el teléfono. En la mesa lo escanean.
      </Text>
    </>
  );
}
