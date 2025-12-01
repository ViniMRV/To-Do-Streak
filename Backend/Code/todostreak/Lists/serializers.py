from rest_framework import serializers
from .models import List, Item


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ("id", "text", "done", "order", "completed_at", "todo_list")

class ListSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, required=False)
    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = List
        fields = ("id", "title", "description", "image", "created_at", "owner", "items")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        
        if not validated_data.get("title"):
            validated_data["title"] = "lista"
            
        lst = List.objects.create(**validated_data)
        
        for idx, item in enumerate(items_data):
            Item.objects.create(todo_list=lst, order=item.get("order", idx), text=item.get("text", ""), done=item.get("done", False))
        return lst

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        if validated_data.get("image") is not None:
            instance.image = validated_data.get("image")
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for idx, item in enumerate(items_data):
                Item.objects.create(todo_list=instance, order=item.get("order", idx), text=item.get("text", ""), done=item.get("done", False))

        return instance
