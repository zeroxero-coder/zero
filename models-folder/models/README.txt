ضعي ملفات .fbx هنا (وصور thumb اختيارية بصيغة jpg/png لنفس الاسم + "-thumb")
مثال: model1.fbx + model1-thumb.jpg

بعدها في index.html عدّلي مصفوفة models3D (ابحثي عن "const models3D") وأضيفي سطر:
{ name: 'اسم النموذج', file: MD + 'model1.fbx', thumb: MD + 'model1-thumb.jpg' },
