"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/components/mock-api";
import { NotificationKind, NotificationRecord } from "@/components/mock-data";

type NotificationListProps = {
  items: NotificationRecord[];
  isBusy: boolean;
  onDelete: (notificationId: string) => void;
  onMarkRead: (notificationId: string) => void;
  onOpen: (notification: NotificationRecord) => void;
};

function getKindLabel(kind: NotificationKind) {
  switch (kind) {
    case "success":
      return "Успех";
    case "warning":
      return "Важно";
    default:
      return "Новость";
  }
}

function getKindClassName(kind: NotificationKind) {
  switch (kind) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return "";
  }
}

function NotificationList({
  items,
  isBusy,
  onDelete,
  onMarkRead,
  onOpen,
}: NotificationListProps) {
  if (isBusy) {
    return <div className="notification-empty-state">Загружаем уведомления...</div>;
  }

  if (items.length === 0) {
    return <div className="notification-empty-state">Пока уведомлений нет.</div>;
  }

  return (
    <div className="notification-list">
      {items.map((item) => (
        <article
          className={`notification-card${item.isRead ? "" : " is-unread"}`}
          key={item.id}
          onClick={() => onOpen(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(item);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="notification-card-head">
            <span className={`pill ${getKindClassName(item.kind)}`}>{getKindLabel(item.kind)}</span>
            <span className="table-muted">{item.createdAt}</span>
          </div>
          <strong>{item.title}</strong>
          <p className="notification-card-message">{item.message}</p>
          <div className="inline-actions notification-inline-actions">
            {!item.isRead ? (
              <button
                className="button button-secondary notification-action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkRead(item.id);
                }}
                type="button"
              >
                Пометить прочитанным
              </button>
            ) : null}
            <button
              className="button button-secondary notification-action-button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(item.id);
              }}
              type="button"
            >
              Удалить
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function NotificationCenter() {
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedNotification(null);
      return;
    }

    let isActive = true;

    async function loadNotifications() {
      try {
        const nextItems = await listNotifications();

        if (isActive) {
          setItems(nextItems);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 15000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!selectedNotification) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedNotification(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedNotification]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const previewItems = useMemo(() => items.slice(0, 4), [items]);
  const openedNotification =
    selectedNotification
      ? items.find((item) => item.id === selectedNotification.id) ?? selectedNotification
      : null;

  async function handleMarkRead(notificationId: string) {
    const updated = await markNotificationRead(notificationId);
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedNotification((current) => (current?.id === updated.id ? updated : current));
  }

  async function handleDelete(notificationId: string) {
    await deleteNotification(notificationId);
    setItems((current) => current.filter((item) => item.id !== notificationId));
    setSelectedNotification((current) => (current?.id === notificationId ? null : current));
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setItems((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
      })),
    );
    setSelectedNotification((current) =>
      current
        ? {
            ...current,
            isRead: true,
          }
        : null,
    );
  }

  function handleOpenNotification(notification: NotificationRecord) {
    setSelectedNotification(notification);
    setIsOpen(false);
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="notification-shell" ref={rootRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Уведомления"
          className={`notification-toggle${unreadCount > 0 ? " has-unread" : ""}`}
          id="notification-toggle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <svg aria-hidden="true" className="notification-icon" viewBox="0 0 24 24">
            <path
              d="M12 4a4 4 0 0 0-4 4v2.4c0 .8-.2 1.6-.6 2.3L6 15.5h12l-1.4-2.8c-.4-.7-.6-1.5-.6-2.3V8a4 4 0 0 0-4-4Z"
              fill="currentColor"
            />
            <path
              d="M9.8 18a2.4 2.4 0 0 0 4.4 0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
          {unreadCount > 0 ? (
            <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          ) : null}
        </button>

        {isOpen ? (
          <section
            aria-label="Уведомления"
            className="notification-popover"
            id="notification-popover"
          >
            <div className="notification-popover-head">
              <div>
                <strong>Уведомления</strong>
                <span className="table-muted">Непрочитанных: {unreadCount}</span>
              </div>
              <div className="inline-actions notification-popover-actions">
                <button
                  className="button button-secondary notification-toolbar-button"
                  disabled={unreadCount === 0}
                  id="notification-mark-all"
                  onClick={() => void handleMarkAllRead()}
                  type="button"
                >
                  Прочитать все
                </button>
              </div>
            </div>

            <NotificationList
              isBusy={isLoading}
              items={previewItems}
              onDelete={(notificationId) => void handleDelete(notificationId)}
              onMarkRead={(notificationId) => void handleMarkRead(notificationId)}
              onOpen={handleOpenNotification}
            />
          </section>
        ) : null}
      </div>

      {openedNotification ? (
        <div
          className="notification-overlay"
          onClick={() => setSelectedNotification(null)}
          role="presentation"
        >
          <section
            aria-label="Сообщение"
            aria-modal="true"
            className="notification-modal"
            id="notification-message-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="notification-modal-head">
              <div className="notification-modal-meta">
                <span className={`pill ${getKindClassName(openedNotification.kind)}`}>
                  {getKindLabel(openedNotification.kind)}
                </span>
                <h2 className="section-title">{openedNotification.title}</h2>
                <p className="notification-modal-copy">{openedNotification.createdAt}</p>
              </div>
              <div className="inline-actions notification-popover-actions">
                {!openedNotification.isRead ? (
                  <button
                    className="button button-secondary notification-toolbar-button"
                    onClick={() => void handleMarkRead(openedNotification.id)}
                    type="button"
                  >
                    Пометить прочитанным
                  </button>
                ) : null}
                <button
                  className="button button-secondary notification-toolbar-button"
                  onClick={() => void handleDelete(openedNotification.id)}
                  type="button"
                >
                  Удалить
                </button>
                <button
                  className="button button-secondary notification-toolbar-button"
                  id="notification-message-close"
                  onClick={() => setSelectedNotification(null)}
                  type="button"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <article className="notification-detail-card">
              <p className="notification-detail-message">{openedNotification.message}</p>
            </article>
          </section>
        </div>
      ) : null}
    </>
  );
}
