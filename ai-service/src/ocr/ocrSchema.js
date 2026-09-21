export const ocrResponseSchema = {
    type: "object",

    properties: {
        documentType: {
            type: "string",
            enum: [
                "prescription",
                "lab_report",
                "discharge_summary",
                "radiology_report",
                "medical_certificate",
                "vaccination_record",
                "operative_report",
                "other",
                "unknown"
            ]
        },

        rawText: {
            type: "string"
        },

        summary: {
            type: "string"
        },

        extracted: {
            type: "object",

            properties: {
                documentDate: {
                    type: ["string", "null"]
                },

                patientName: {
                    type: ["string", "null"]
                },

                doctorName: {
                    type: ["string", "null"]
                },

                diagnoses: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                },

                medications: {
                    type: "array",

                    items: {
                        type: "object",

                        properties: {
                            name: {
                                type: "string"
                            },

                            strength: {
                                type: ["string", "null"]
                            },

                            dosage: {
                                type: ["string", "null"]
                            },

                            frequency: {
                                type: ["string", "null"]
                            },

                            duration: {
                                type: ["string", "null"]
                            }
                        },

                        required: [
                            "name",
                            "strength",
                            "dosage",
                            "frequency",
                            "duration"
                        ]
                    }
                },

                investigations: {
                    type: "array",

                    items: {
                        type: "object",

                        properties: {
                            name: {
                                type: "string"
                            },

                            value: {
                                type: ["string", "null"]
                            },

                            unit: {
                                type: ["string", "null"]
                            },

                            referenceRange: {
                                type: ["string", "null"]
                            },

                            abnormalAsReported: {
                                type: ["boolean", "null"]
                            }
                        },

                        required: [
                            "name",
                            "value",
                            "unit",
                            "referenceRange",
                            "abnormalAsReported"
                        ]
                    }
                }
            },

            required: [
                "documentDate",
                "patientName",
                "doctorName",
                "diagnoses",
                "medications",
                "investigations"
            ]
        },

        warnings: {
            type: "array",
            items: {
                type: "string"
            }
        }
    },

    required: [
        "documentType",
        "rawText",
        "summary",
        "extracted",
        "warnings"
    ]
};