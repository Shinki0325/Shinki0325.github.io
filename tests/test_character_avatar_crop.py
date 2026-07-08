import importlib.util
import sys
import unittest
from pathlib import Path


def load_module():
    script_path = Path(__file__).resolve().parents[1] / "scripts" / "character_avatar_crop.py"
    spec = importlib.util.spec_from_file_location("character_avatar_crop", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CharacterAvatarCropTest(unittest.TestCase):
    def test_tight_face_crop_matches_approved_preview_parameters(self):
        cropper = load_module()

        crop = cropper.crop_from_face(
            image_size=(391, 980),
            face=(144, 88, 143, 143),
            style=cropper.CROP_STYLES["tight"],
        )

        self.assertEqual(crop, (48, 12, 336))

    def test_tight_face_crop_clamps_to_image_edges_without_center_cropping(self):
        cropper = load_module()

        crop = cropper.crop_from_face(
            image_size=(400, 902),
            face=(220, 47, 132, 132),
            style=cropper.CROP_STYLES["tight"],
        )

        self.assertEqual(crop, (90, 0, 310))



if __name__ == "__main__":
    unittest.main()
