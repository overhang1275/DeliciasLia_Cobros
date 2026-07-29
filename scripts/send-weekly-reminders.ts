import { enviarRecordatoriosPendientes } from "@/lib/push";
import { db } from "@/lib/db";

enviarRecordatoriosPendientes()
  .then(({ clientes, sent }) => {
    console.log(`Clientes revisados: ${clientes}`);
    console.log(`Notificaciones enviadas: ${sent}`);
  })
  .finally(() => db.$disconnect());
