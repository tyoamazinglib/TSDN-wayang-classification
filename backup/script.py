import os

path = os.getcwd()
wayang_class = [f for f in os.listdir(path) if not os.path.isfile(os.path.join(path, f))]

class_idx_count = 0
files_idx_count = 0
class_dict = {}


for directory in wayang_class:
    for file in os.listdir(directory):
        if file.endswith(".txt"):
            if file == "classes.txt":
                continue
            else:
                filename, _ = os.path.splitext(file)
                src = os.path.abspath(os.path.join(directory, filename + ".txt"))
                dst = os.path.abspath(os.path.join(directory, str(files_idx_count) + ".txt"))
                with open(src, 'r+', encoding="utf-8") as f:
                    var = f.readline().split()
                    var[0] = str(class_idx_count)
                    new_string = " ".join(var)
                    f.seek(0)
                    f.write(new_string)
                    f.truncate()
                
                src_img = os.path.abspath(os.path.join(directory, filename + ".jpg"))
                dst_img = os.path.abspath(os.path.join(directory, str(files_idx_count) + ".jpg"))
                os.rename(src, dst)
                os.rename(src_img, dst_img)
        if file.endswith(".jpg"):
            continue
        files_idx_count += 1
    class_dict[directory] = class_idx_count
    class_idx_count += 1

print(class_dict)