import json

def parse_json_and_extract_fields(json_file_path, text_file_path, unique_models_path, unique_model_names_path):
    unique_models = set()
    unique_model_names = set()

    try:
        # Open access_points.json
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file) 
        
        with open(text_file_path, 'a') as text_file:
            for item in data:
                name = item['identification']['name']
                model = item['identification']['model']
                modelName = item['identification']['modelName']
                
                unique_models.add(model)
                unique_model_names.add(modelName)
                
                # Format the extracted fields and write to the text file
                line = f"{name}, {model}, {modelName}\n"
                text_file.write(line)
        
        # Write unique models to a file
        with open(unique_models_path, 'w') as models_file:
            for model in sorted(unique_models):  # Sorting for consistency
                models_file.write(f"{model}\n")
        
        # Write unique model names to a file
        with open(unique_model_names_path, 'w') as model_names_file:
            for modelName in sorted(unique_model_names):  # Sorting for consistency
                model_names_file.write(f"{modelName}\n")

    except FileNotFoundError:
        print(f"File not found: {json_file_path}")
    except json.JSONDecodeError:
        print("Error decoding JSON")
    except KeyError as e:
        print(f"Missing key in JSON data: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    json_file_path = 'access_points.json'  
    text_file_path = 'scripts/output/antenna_models.txt'        # The output text file
    unique_models_path = 'scripts/output/unique_models.txt'     # File to store unique models
    unique_model_names_path = 'scripts/output/unique_model_names.txt'  # File to store unique model names

    parse_json_and_extract_fields(json_file_path, text_file_path, unique_models_path, unique_model_names_path)
