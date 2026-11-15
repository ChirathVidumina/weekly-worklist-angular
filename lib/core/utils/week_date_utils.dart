import 'package:intl/intl.dart';

class WeekDateUtils {
  static final DateFormat _keyFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _dayNameFormat = DateFormat('EEE');
  static final DateFormat _dayNumberFormat = DateFormat('d');
  static final DateFormat _shortMonthFormat = DateFormat('MMM d');
  static final DateFormat _fullMonthYearFormat = DateFormat('MMM d, yyyy');

  /// Returns the Monday representing the start of the week for [date].
  /// Monday is 1, Sunday is 7 in DateTime.weekday.
  static DateTime getMondayOfWeek(DateTime date) {
    final clean = DateTime(date.year, date.month, date.day);
    return clean.subtract(Duration(days: clean.weekday - 1));
  }

  /// Returns the 7 days (Monday through Sunday) for the given [monday].
  static List<DateTime> getWeekDates(DateTime monday) {
    return List.generate(7, (index) => monday.add(Duration(days: index)));
  }

  /// Formats date to `yyyy-MM-dd` key used in MongoDB tasks.
  static String formatDateKey(DateTime date) => _keyFormat.format(date);

  static DateTime parseDateKey(String key) {
    try {
      return _keyFormat.parse(key);
    } catch (_) {
      return DateTime.now();
    }
  }

  static String formatDayName(DateTime date) => _dayNameFormat.format(date);

  static String formatDayNumber(DateTime date) => _dayNumberFormat.format(date);

  static String formatDisplayDate(DateTime date) => _shortMonthFormat.format(date);

  /// Returns human-readable range like "Nov 10 – Nov 16, 2026"
  static String formatWeekRange(DateTime monday) {
    final sunday = monday.add(const Duration(days: 6));
    if (monday.year == sunday.year) {
      if (monday.month == sunday.month) {
        return '${DateFormat('MMM d').format(monday)} – ${DateFormat('d, yyyy').format(sunday)}';
      }
      return '${DateFormat('MMM d').format(monday)} – ${DateFormat('MMM d, yyyy').format(sunday)}';
    }
    return '${_fullMonthYearFormat.format(monday)} – ${_fullMonthYearFormat.format(sunday)}';
  }

  static bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return isSameDay(date, now);
  }
}
