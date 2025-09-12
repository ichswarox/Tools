import pyperclip
import shutil
import os
import time

# --- 配置 ---
# 你要将文件复制到的目标目录
DEST_DIR = "/Users/Apple/Documents/GitHub/跨境全链路/docusaurus/Resources/static/img"
# --- 配置结束 ---

def main():
    """
    主函数，用于监控剪贴板并复制文件。
    """
    # 检查目标目录是否存在，如果不存在则打印错误信息并退出
    if not os.path.isdir(DEST_DIR):
        print(f"❌ 错误：目标目录不存在: {DEST_DIR}")
        print("请检查路径是否正确或手动创建该目录。")
        return

    print("✅ 脚本已启动，正在监控剪贴板...")
    print(f"   目标目录: {DEST_DIR}")
    print("   (按 Control + C 停止脚本)")

    # 用于存放上一次处理过的路径，防止重复复制
    last_processed_path = ""

    try:
        while True:
            # 从剪贴板获取当前内容
            clipboard_content = pyperclip.paste().strip()

            # 检查剪贴板内容是否是一个有效、存在的文件，并且不是我们刚刚处理过的
            if clipboard_content and clipboard_content != last_processed_path and os.path.isfile(clipboard_content):
                
                source_path = clipboard_content
                file_name = os.path.basename(source_path)
                destination_path = os.path.join(DEST_DIR, file_name)

                print(f"\n✨ 检测到新文件路径: {source_path}")

                # 检查目标位置是否已存在同名文件
                if os.path.exists(destination_path):
                    print(f"🟡 警告：文件 '{file_name}' 已存在于目标目录，跳过复制。")
                else:
                    try:
                        # 复制文件到目标目录，shutil.copy2 会同时复制元数据（如创建时间等）
                        shutil.copy2(source_path, DEST_DIR)
                        print(f"👍 成功复制 '{file_name}' 到目标目录！")
                    except Exception as e:
                        print(f"❌ 复制文件时出错: {e}")
                
                # 更新最后处理的路径，无论成功与否都更新，避免无限次重试
                last_processed_path = clipboard_content

            # 每隔1秒检查一次，避免CPU占用过高
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n👋 脚本已停止。下次再见！")
    except Exception as e:
        print(f"\n❌ 脚本遇到未知错误: {e}")

if __name__ == "__main__":
    main()