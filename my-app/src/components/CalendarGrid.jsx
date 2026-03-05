import React from 'react';
import { getDaysInMonth, getFirstDayOfMonth } from '../lib/dateUtils';
import { parseISO, addDays, addMonths, addYears, isSameMonth, getDate, set } from 'date-fns';
import { Icon } from '@iconify-icon/react';
import styles from './CalendarGrid.module.css';

function CalendarGrid({ subscriptions, onDateClick, currentDate }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Map subscriptions by date
    const subscriptionsByDate = {};

    subscriptions.forEach((sub, index) => {
        // Check for billingDate property with fallback to old properties
        const dueDate = sub.billingDate || sub.dueDate || sub.startDate;

        if (dueDate) {
            try {
                let currentDateInstance = parseISO(dueDate);

                // Set the currentDate time to noon to avoid timezone issues
                currentDateInstance = set(currentDateInstance, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

                const endDate = set(new Date(year, month + 1, 0), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

                // Get interval info
                const intervalUnit = sub.recurrenceType || sub.intervalUnit || 'months';
                const intervalValue = sub.recurrenceInterval || sub.intervalValue || 1;

                // Safety cap on loop iterations
                let iterations = 0;
                while (currentDateInstance <= endDate && iterations < 1000) {
                    iterations++;
                    if (isSameMonth(currentDateInstance, new Date(year, month))) {
                        const dateKey = getDate(currentDateInstance);

                        if (!subscriptionsByDate[dateKey]) {
                            subscriptionsByDate[dateKey] = [];
                        }

                        subscriptionsByDate[dateKey].push({
                            id: sub.id,
                            icon: sub.icon,
                            color: sub.color,
                            dueDate: dueDate,
                            intervalUnit: intervalUnit,
                            intervalValue: typeof intervalValue === 'string' ? parseInt(intervalValue, 10) : intervalValue
                        });
                    }

                    // Move to the next occurrence based on the interval
                    const intervalValueNumber = typeof intervalValue === 'string' ? parseInt(intervalValue, 10) : intervalValue;

                    switch (intervalUnit) {
                        case 'days':
                            currentDateInstance = addDays(currentDateInstance, intervalValueNumber);
                            break;
                        case 'weeks':
                            currentDateInstance = addDays(currentDateInstance, intervalValueNumber * 7);
                            break;
                        case 'months':
                            currentDateInstance = addMonths(currentDateInstance, intervalValueNumber);
                            break;
                        case 'years':
                            currentDateInstance = addYears(currentDateInstance, intervalValueNumber);
                            break;
                        default:
                            currentDateInstance = addDays(endDate, 1); // Stop the loop for non-recurring subscriptions
                    }
                }
            } catch (error) {
                console.error(`Error processing subscription ${sub.id}:`, error);
            }
        } else {
            console.log(`Subscription ${index} has no due date`);
        }
    });

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarGrid}>
                {daysOfWeek.map((day) => (
                    <div key={day} className={styles.calendarDayHeader}>
                        {day}
                    </div>
                ))}
                {Array(firstDayOfMonth)
                    .fill(null)
                    .map((_, index) => (
                        <div key={`empty-${index}`} className={`${styles.calendarDay} ${styles.empty}`}></div>
                    ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const subs = subscriptionsByDate[day] || [];
                    const isToday =
                        year === today.getFullYear() &&
                        month === today.getMonth() &&
                        day === today.getDate();
                    return (
                        <div
                            key={day}
                            className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}
                            onClick={() => onDateClick(new Date(year, month, day))}
                        >
                            <div className={styles.dateNumber}>{day}</div>
                            <div className={styles.subscriptions}>
                                {subs.map((sub, index) => (
                                    <Icon
                                        key={`${sub.id}-${index}`}
                                        icon={sub.icon?.includes(':') ? sub.icon : `mdi:${sub.icon || 'calendar'}`}
                                        className={styles.subscriptionIcon}
                                        style={{ color: sub.color || '#20c997' }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarGrid;
