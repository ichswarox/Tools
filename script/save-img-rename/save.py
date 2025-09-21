import os
from datetime import datetime
from PIL import ImageGrab, Image

def save_clipboard_image_as_png():
    """
    Checks for an image on the clipboard and saves it as a PNG file
    in a specified directory with a timestamped filename.
    """
    # --- Configuration ---
    output_dir = "/Users/Apple/Downloads/ae-images"
    # -------------------

    try:
        # Create the output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Get the image from the clipboard
        img = ImageGrab.grabclipboard()

        if img and isinstance(img, Image.Image):
            # Generate a unique filename with the current timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"clipboard_image_{timestamp}.png"
            output_path = os.path.join(output_dir, output_filename)

            # Save the image as PNG (不需要RGB转换，PNG支持透明通道)
            img.save(output_path, 'png')

            print(f"Image saved to: {output_path}")
        else:
            print("No image found on the clipboard.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    save_clipboard_image_as_png()
    