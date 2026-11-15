class TaskModel {
  final String id;
  final String title;
  final String? description;
  final String date;
  final String dateKey;
  final String priority;
  final String? categoryId;
  final String category;
  final String status;
  final int estimatedMinutes;
  final int order;
  final List<String> tags;
  final String? completedAt;
  final String? createdAt;
  final String? updatedAt;

  const TaskModel({
    required this.id,
    required this.title,
    this.description,
    required this.date,
    required this.dateKey,
    this.priority = 'MEDIUM',
    this.categoryId,
    this.category = 'Work',
    this.status = 'TODO',
    this.estimatedMinutes = 30,
    this.order = 0,
    this.tags = const [],
    this.completedAt,
    this.createdAt,
    this.updatedAt,
  });

  bool get isCompleted => status.toUpperCase() == 'COMPLETED';

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      date: json['date'] as String? ?? json['dateKey'] as String? ?? '',
      dateKey: json['dateKey'] as String? ?? json['date'] as String? ?? '',
      priority: json['priority'] as String? ?? 'MEDIUM',
      categoryId: json['categoryId'] as String?,
      category: json['category'] as String? ?? 'Work',
      status: json['status'] as String? ?? 'TODO',
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt() ?? 30,
      order: (json['order'] as num?)?.toInt() ?? 0,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      completedAt: json['completedAt'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      if (description != null) 'description': description,
      'date': date,
      'dateKey': dateKey,
      'priority': priority,
      if (categoryId != null) 'categoryId': categoryId,
      'category': category,
      'status': status,
      'estimatedMinutes': estimatedMinutes,
      'order': order,
      'tags': tags,
      if (completedAt != null) 'completedAt': completedAt,
    };
  }

  TaskModel copyWith({
    String? id,
    String? title,
    String? description,
    String? date,
    String? dateKey,
    String? priority,
    String? categoryId,
    String? category,
    String? status,
    int? estimatedMinutes,
    int? order,
    List<String>? tags,
    String? completedAt,
    String? createdAt,
    String? updatedAt,
  }) {
    return TaskModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      date: date ?? this.date,
      dateKey: dateKey ?? this.dateKey,
      priority: priority ?? this.priority,
      categoryId: categoryId ?? this.categoryId,
      category: category ?? this.category,
      status: status ?? this.status,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      order: order ?? this.order,
      tags: tags ?? this.tags,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class TaskRequestModel {
  final String title;
  final String? description;
  final String dateKey;
  final String priority;
  final String? categoryId;
  final String? category;
  final String status;
  final int estimatedMinutes;
  final int? order;
  final List<String>? tags;

  const TaskRequestModel({
    required this.title,
    this.description,
    required this.dateKey,
    this.priority = 'MEDIUM',
    this.categoryId,
    this.category,
    this.status = 'TODO',
    this.estimatedMinutes = 30,
    this.order,
    this.tags,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null && description!.isNotEmpty) 'description': description,
      'dateKey': dateKey,
      'date': dateKey,
      'priority': priority,
      if (categoryId != null) 'categoryId': categoryId,
      if (category != null) 'category': category,
      'status': status,
      'estimatedMinutes': estimatedMinutes,
      if (order != null) 'order': order,
      if (tags != null) 'tags': tags,
    };
  }
}
