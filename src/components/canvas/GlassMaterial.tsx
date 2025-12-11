"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { Color } from "three";

type GlassMaterialProps = {
    transmission?: number;
    thickness?: number;
    roughness?: number;
    chromaticAberration?: number;
    anisotropy?: number;
    distortion?: number;
    distortionScale?: number;
    temporalDistortion?: number;
    color?: string | Color;
    background?: Color;
};

export default function GlassMaterial({
    transmission = 0.95,
    thickness = 1.2,
    roughness = 0.2,
    chromaticAberration = 0.06,
    anisotropy = 0.1,
    distortion = 0.0,
    distortionScale = 0.3,
    temporalDistortion = 0.5,
    color = "#ffffff",
    ...props
}: GlassMaterialProps) {

    return (
        <MeshTransmissionMaterial
            transmission={transmission}
            thickness={thickness}
            roughness={roughness}
            chromaticAberration={chromaticAberration}
            anisotropy={anisotropy}
            distortion={distortion}
            distortionScale={distortionScale}
            temporalDistortion={temporalDistortion}
            color={color}
            {...props}
            resolution={1024}
            samples={16}
            backside={true}
            backsideThickness={1.0}
        />
    );
}
