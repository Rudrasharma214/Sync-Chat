const DEFAULT_LIMIT = 20;

export const messageQueryKeys = {
    byConversation: (conversationId) => ["messages", conversationId],
};

export const getConversationId = (message) => {
    const conversationRef = message?.conversationId;
    if (!conversationRef) {
        return null;
    }

    return typeof conversationRef === "object" ? conversationRef._id : conversationRef;
};

export const getMessageId = (message) => message?._id || message?.id;

export const appendMessage = (oldData, message) => {
    const messageId = getMessageId(message);
    if (!messageId) {
        return oldData;
    }

    if (!oldData || !Array.isArray(oldData.pages) || oldData.pages.length === 0) {
        return {
            pages: [
                {
                    messages: [message],
                    pagination: {
                        page: 1,
                        limit: DEFAULT_LIMIT,
                        total: 1,
                        hasNextPage: false,
                    },
                },
            ],
            pageParams: [1],
        };
    }

    const updatedPages = oldData.pages.map((page, pageIndex) => {
        if (pageIndex !== 0 || !Array.isArray(page?.messages)) {
            return page;
        }

        const exists = page.messages.some((item) => getMessageId(item) === messageId);
        if (exists) {
            return page;
        }

        return {
            ...page,
            messages: [...page.messages, message],
            pagination: page.pagination
                ? {
                    ...page.pagination,
                    total:
                        typeof page.pagination.total === "number"
                            ? page.pagination.total + 1
                            : page.pagination.total,
                }
                : page.pagination,
        };
    });

    return { ...oldData, pages: updatedPages };
};

export const replaceMessage = (oldData, updatedMessage) => {
    if (!oldData || !Array.isArray(oldData.pages)) {
        return oldData;
    }

    const updatedId = getMessageId(updatedMessage);
    if (!updatedId) {
        return oldData;
    }

    const pages = oldData.pages.map((page) => {
        if (!Array.isArray(page?.messages)) {
            return page;
        }

        return {
            ...page,
            messages: page.messages.map((message) =>
                getMessageId(message) === updatedId ? { ...message, ...updatedMessage } : message
            ),
        };
    });

    return { ...oldData, pages };
};

export const removeMessage = (oldData, messageId) => {
    if (!oldData || !Array.isArray(oldData.pages) || !messageId) {
        return oldData;
    }

    const removedCount = oldData.pages.reduce((count, page) => {
        if (!Array.isArray(page?.messages)) {
            return count;
        }

        return count + page.messages.filter((message) => getMessageId(message) === messageId).length;
    }, 0);

    if (removedCount === 0) {
        return oldData;
    }

    const pages = oldData.pages.map((page) => {
        if (!Array.isArray(page?.messages)) {
            return page;
        }

        const nextMessages = page.messages.filter((message) => getMessageId(message) !== messageId);

        return {
            ...page,
            messages: nextMessages,
            pagination: page.pagination
                ? {
                    ...page.pagination,
                    total:
                        typeof page.pagination.total === "number"
                            ? Math.max(page.pagination.total - removedCount, 0)
                            : page.pagination.total,
                }
                : page.pagination,
        };
    });

    return { ...oldData, pages };
};
