class CategoryModel {
  final String id;
  final String name;
  final String color;
  final bool isDefault;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.color,
    this.isDefault = false,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'General',
      color: json['color'] as String? ?? '#6366F1',
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'isDefault': isDefault,
    };
  }

  CategoryModel copyWith({
    String? id,
    String? name,
    String? color,
    bool? isDefault,
  }) {
    return CategoryModel(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
