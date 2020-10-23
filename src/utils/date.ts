import { formatDistanceToNow } from 'date-fns'

export const formatDateIso = (d: Date) => d.toUTCString()

export const timeAgo = (d: Date) => formatDistanceToNow(d)
