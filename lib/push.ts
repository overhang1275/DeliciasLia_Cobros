import { db } from "@/lib/db";
import { moneyFormatter } from "@/lib/formatters";
import { publicEstadoUrl } from "@/lib/public-url";
import { saldoVentas } from "@/lib/saldos";

type ReminderTarget = { clienteId: number } | { token: string };

const money = moneyFormatter;

export async function enviarRecordatorioPago(target: ReminderTarget) {
  const cliente = await db.cliente.findFirst({
    where: "token" in target ? { estadoToken: target.token } : { id: target.clienteId },
    include: {
      pushSubscriptions: true,
      ventas: { where: { estado: { not: "CANCELADA" } }, include: { pagos: true } }
    }
  });

  if (!cliente?.estadoToken) return { error: "Cliente no encontrado", sent: 0, status: 404 };

  const saldo = saldoVentas(cliente.ventas);
  if (saldo <= 0) return { error: "Sin saldo pendiente", sent: 0, status: 400 };
  if (cliente.pushSubscriptions.length === 0) return { error: "Sin suscripciones", sent: 0, status: 404 };
  if (!process.env.VAPID_SUBJECT || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { error: "Faltan variables VAPID", sent: 0, status: 500 };
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  let sent = 0;
  for (const sub of cliente.pushSubscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
        JSON.stringify({
          body: `Tienes un saldo pendiente de ${money.format(saldo)}. Puedes ver tu estado de cuenta aquí.`,
          title: "Recordatorio de pago",
          url: publicEstadoUrl(cliente.estadoToken)
        })
      );
      sent++;
    } catch (err: unknown) {
      const pushError = err as { statusCode?: number };
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await db.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }

  return { sent, status: 200 };
}

export async function enviarRecordatoriosPendientes() {
  const clientes = await db.cliente.findMany({
    where: {
      activo: true,
      pushSubscriptions: { some: {} },
      ventas: { some: { estado: { in: ["FIADA", "PARCIAL"] } } }
    },
    select: { id: true }
  });

  let sent = 0;
  for (const cliente of clientes) {
    sent += (await enviarRecordatorioPago({ clienteId: cliente.id })).sent;
  }
  return { clientes: clientes.length, sent };
}
