<?php

$string_0 = "tao";
$string_1 = "3.0.0";
$array_0 = array();
$viewcollection_0 = new qtism\data\ViewCollection($array_0);
$string_2 = "";
$string_3 = "";
$boolean_0 = false;
$boolean_1 = false;
$boolean_2 = false;
$nullvalue_0 = null;
$string_4 = "tao-testTaker-firstName";
$integer_0 = 4;
$integer_1 = 0;
$nullvalue_1 = null;
$outcomedeclaration_0 = new qtism\data\state\OutcomeDeclaration($string_4, $integer_0, $integer_1, $nullvalue_1);
$outcomedeclaration_0->setViews($viewcollection_0);
$outcomedeclaration_0->setInterpretation($string_2);
$outcomedeclaration_0->setLongInterpretation($string_3);
$outcomedeclaration_0->setNormalMaximum($boolean_0);
$outcomedeclaration_0->setNormalMinimum($boolean_1);
$outcomedeclaration_0->setMasteryValue($boolean_2);
$outcomedeclaration_0->setLookupTable($nullvalue_0);
$array_1 = array();
$viewcollection_1 = new qtism\data\ViewCollection($array_1);
$string_5 = "";
$string_6 = "";
$boolean_3 = false;
$boolean_4 = false;
$boolean_5 = false;
$nullvalue_2 = null;
$string_7 = "tao-testTaker-lastName";
$integer_2 = 4;
$integer_3 = 0;
$nullvalue_3 = null;
$outcomedeclaration_1 = new qtism\data\state\OutcomeDeclaration($string_7, $integer_2, $integer_3, $nullvalue_3);
$outcomedeclaration_1->setViews($viewcollection_1);
$outcomedeclaration_1->setInterpretation($string_5);
$outcomedeclaration_1->setLongInterpretation($string_6);
$outcomedeclaration_1->setNormalMaximum($boolean_3);
$outcomedeclaration_1->setNormalMinimum($boolean_4);
$outcomedeclaration_1->setMasteryValue($boolean_5);
$outcomedeclaration_1->setLookupTable($nullvalue_2);
$array_2 = array();
$viewcollection_2 = new qtism\data\ViewCollection($array_2);
$string_8 = "";
$string_9 = "";
$boolean_6 = false;
$boolean_7 = false;
$boolean_8 = false;
$nullvalue_4 = null;
$string_10 = "tao-testTaker-companyName";
$integer_4 = 4;
$integer_5 = 0;
$nullvalue_5 = null;
$outcomedeclaration_2 = new qtism\data\state\OutcomeDeclaration($string_10, $integer_4, $integer_5, $nullvalue_5);
$outcomedeclaration_2->setViews($viewcollection_2);
$outcomedeclaration_2->setInterpretation($string_8);
$outcomedeclaration_2->setLongInterpretation($string_9);
$outcomedeclaration_2->setNormalMaximum($boolean_6);
$outcomedeclaration_2->setNormalMinimum($boolean_7);
$outcomedeclaration_2->setMasteryValue($boolean_8);
$outcomedeclaration_2->setLookupTable($nullvalue_4);
$array_3 = array($outcomedeclaration_0, $outcomedeclaration_1, $outcomedeclaration_2);
$outcomedeclarationcollection_0 = new qtism\data\state\OutcomeDeclarationCollection($array_3);
$nullvalue_6 = null;
$nullvalue_7 = null;
$boolean_9 = false;
$timelimits_0 = new qtism\data\TimeLimits($nullvalue_6, $nullvalue_7, $boolean_9);
$array_4 = array();
$outcomerulecollection_0 = new qtism\data\rules\OutcomeRuleCollection($array_4);
$outcomeprocessing_0 = new qtism\data\processing\OutcomeProcessing($outcomerulecollection_0);
$array_5 = array();
$testfeedbackcollection_0 = new qtism\data\TestFeedbackCollection($array_5);
$string_11 = "ACT_4_sec_16_items_IBN";
$string_12 = "ACT_4_sec_16_items_IBN";
$array_6 = array();
$preconditioncollection_0 = new qtism\data\rules\PreConditionCollection($array_6);
$array_7 = array();
$branchrulecollection_0 = new qtism\data\rules\BranchRuleCollection($array_7);
$integer_6 = 1;
$boolean_10 = false;
$boolean_11 = true;
$boolean_12 = false;
$boolean_13 = false;
$boolean_14 = false;
$boolean_15 = true;
$itemsessioncontrol_0 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_0->setMaxAttempts($integer_6);
$itemsessioncontrol_0->setShowFeedback($boolean_10);
$itemsessioncontrol_0->setAllowReview($boolean_11);
$itemsessioncontrol_0->setShowSolution($boolean_12);
$itemsessioncontrol_0->setAllowComment($boolean_13);
$itemsessioncontrol_0->setValidateResponses($boolean_14);
$itemsessioncontrol_0->setAllowSkipping($boolean_15);
$nullvalue_8 = null;
$nullvalue_9 = null;
$boolean_16 = false;
$timelimits_1 = new qtism\data\TimeLimits($nullvalue_8, $nullvalue_9, $boolean_16);
$array_8 = array();
$testfeedbackcollection_1 = new qtism\data\TestFeedbackCollection($array_8);
$string_13 = "TestPart_ENG70A_1446";
$array_9 = array();
$rubricblockrefcollection_0 = new qtism\data\content\RubricBlockRefCollection($array_9);
$boolean_17 = true;
$nullvalue_10 = null;
$nullvalue_11 = null;
$array_10 = array();
$rubricblockcollection_0 = new qtism\data\content\RubricBlockCollection($array_10);
$array_11 = array();
$viewcollection_3 = new qtism\data\ViewCollection($array_11);
$string_14 = "";
$string_15 = "";
$boolean_18 = false;
$boolean_19 = false;
$boolean_20 = false;
$nullvalue_12 = null;
$string_16 = "SCORE";
$integer_7 = 3;
$integer_8 = 0;
$nullvalue_13 = null;
$outcomedeclaration_3 = new qtism\data\state\OutcomeDeclaration($string_16, $integer_7, $integer_8, $nullvalue_13);
$outcomedeclaration_3->setViews($viewcollection_3);
$outcomedeclaration_3->setInterpretation($string_14);
$outcomedeclaration_3->setLongInterpretation($string_15);
$outcomedeclaration_3->setNormalMaximum($boolean_18);
$outcomedeclaration_3->setNormalMinimum($boolean_19);
$outcomedeclaration_3->setMasteryValue($boolean_20);
$outcomedeclaration_3->setLookupTable($nullvalue_12);
$array_12 = array($outcomedeclaration_3);
$outcomedeclarationcollection_1 = new qtism\data\state\OutcomeDeclarationCollection($array_12);
$string_17 = "A";
$integer_9 = 0;
$string_18 = "";
$value_0 = new qtism\data\state\Value($string_17, $integer_9, $string_18);
$array_13 = array($value_0);
$valuecollection_0 = new qtism\data\state\ValueCollection($array_13);
$string_19 = "";
$correctresponse_0 = new qtism\data\state\CorrectResponse($valuecollection_0, $string_19);
$nullvalue_14 = null;
$nullvalue_15 = null;
$string_20 = "RESPONSE";
$integer_10 = 0;
$integer_11 = 0;
$nullvalue_16 = null;
$responsedeclaration_0 = new qtism\data\state\ResponseDeclaration($string_20, $integer_10, $integer_11, $nullvalue_16);
$responsedeclaration_0->setCorrectResponse($correctresponse_0);
$responsedeclaration_0->setMapping($nullvalue_14);
$responsedeclaration_0->setAreaMapping($nullvalue_15);
$array_14 = array($responsedeclaration_0);
$responsedeclarationcollection_0 = new qtism\data\state\ResponseDeclarationCollection($array_14);
$string_21 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_22 = "";
$array_15 = array();
$responserulecollection_0 = new qtism\data\rules\ResponseRuleCollection($array_15);
$responseprocessing_0 = new qtism\data\processing\ResponseProcessing($responserulecollection_0);
$responseprocessing_0->setTemplate($string_21);
$responseprocessing_0->setTemplateLocation($string_22);
$boolean_21 = false;
$boolean_22 = false;
$array_16 = array();
$variablemappingcollection_0 = new qtism\data\state\VariableMappingCollection($array_16);
$array_17 = array();
$weightcollection_0 = new qtism\data\state\WeightCollection($array_17);
$array_18 = array();
$templatedefaultcollection_0 = new qtism\data\state\TemplateDefaultCollection($array_18);
$boolean_23 = false;
$boolean_24 = false;
$array_19 = array();
$preconditioncollection_1 = new qtism\data\rules\PreConditionCollection($array_19);
$array_20 = array();
$branchrulecollection_1 = new qtism\data\rules\BranchRuleCollection($array_20);
$integer_12 = 0;
$boolean_25 = false;
$boolean_26 = true;
$boolean_27 = false;
$boolean_28 = false;
$boolean_29 = false;
$boolean_30 = true;
$itemsessioncontrol_1 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_1->setMaxAttempts($integer_12);
$itemsessioncontrol_1->setShowFeedback($boolean_25);
$itemsessioncontrol_1->setAllowReview($boolean_26);
$itemsessioncontrol_1->setShowSolution($boolean_27);
$itemsessioncontrol_1->setAllowComment($boolean_28);
$itemsessioncontrol_1->setValidateResponses($boolean_29);
$itemsessioncontrol_1->setAllowSkipping($boolean_30);
$nullvalue_17 = null;
$nullvalue_18 = null;
$boolean_31 = false;
$timelimits_2 = new qtism\data\TimeLimits($nullvalue_17, $nullvalue_18, $boolean_31);
$string_23 = "I104_02488-02";
$string_24 = "http://tao.local/tao.rdf#i5e28323826b8411408820419e6118f2b6d|http://tao.local/tao.rdf#i5e283280ad1dc11408"
    . "6a832d1c48abc0d0+|http://tao.local/tao.rdf#i5e283280ad23111408fd48ea93c8d2111d-";
$string_25 = "x-tao-option-reviewScreen";
$string_26 = "x-tao-option-markReview";
$string_27 = "x-tao-option-exit";
$string_28 = "x-tao-option-nextSection";
$string_29 = "x-tao-option-nextSectionWarning";
$string_30 = "x-tao-option-eliminator";
$string_31 = "x-tao-option-answerMasking";
$string_32 = "x-tao-option-areaMasking";
$string_33 = "x-tao-option-calculator";
$string_34 = "x-tao-option-highlighter";
$string_35 = "x-tao-option-magnifier";
$string_36 = "x-tao-option-scratchpad";
$string_37 = "x-tao-option-line-reader";
$string_38 = "x-tao-proctored-auto-pause";
$string_39 = "x-tao-option-answerMasking";
$string_40 = "x-tao-option-areaMasking";
$string_41 = "x-tao-option-lineReader";
$string_42 = "x-tao-option-magnifier";
$string_43 = "x-tao-option-zoom";
$string_44 = "x-tao-option-eliminator";
$array_21 = [
    $string_25,
    $string_26,
    $string_27,
    $string_28,
    $string_29,
    $string_30,
    $string_31,
    $string_32,
    $string_33,
    $string_34,
    $string_35,
    $string_36,
    $string_37,
    $string_38,
    $string_39,
    $string_40,
    $string_41,
    $string_42,
    $string_43,
    $string_44,
];
$identifiercollection_0 = new qtism\common\collections\IdentifierCollection($array_21);
$extendedassessmentitemref_0 = new qtism\data\ExtendedAssessmentItemRef(
    $string_23,
    $string_24,
    $identifiercollection_0
);
$extendedassessmentitemref_0->setOutcomeDeclarations($outcomedeclarationcollection_1);
$extendedassessmentitemref_0->setResponseDeclarations($responsedeclarationcollection_0);
$extendedassessmentitemref_0->setResponseProcessing($responseprocessing_0);
$extendedassessmentitemref_0->setAdaptive($boolean_21);
$extendedassessmentitemref_0->setTimeDependent($boolean_22);
$extendedassessmentitemref_0->setVariableMappings($variablemappingcollection_0);
$extendedassessmentitemref_0->setWeights($weightcollection_0);
$extendedassessmentitemref_0->setTemplateDefaults($templatedefaultcollection_0);
$extendedassessmentitemref_0->setRequired($boolean_23);
$extendedassessmentitemref_0->setFixed($boolean_24);
$extendedassessmentitemref_0->setPreConditions($preconditioncollection_1);
$extendedassessmentitemref_0->setBranchRules($branchrulecollection_1);
$extendedassessmentitemref_0->setItemSessionControl($itemsessioncontrol_1);
$extendedassessmentitemref_0->setTimeLimits($timelimits_2);
$array_22 = array();
$viewcollection_4 = new qtism\data\ViewCollection($array_22);
$string_45 = "";
$string_46 = "";
$boolean_32 = false;
$boolean_33 = false;
$boolean_34 = false;
$nullvalue_19 = null;
$string_47 = "SCORE";
$integer_13 = 3;
$integer_14 = 0;
$nullvalue_20 = null;
$outcomedeclaration_4 = new qtism\data\state\OutcomeDeclaration($string_47, $integer_13, $integer_14, $nullvalue_20);
$outcomedeclaration_4->setViews($viewcollection_4);
$outcomedeclaration_4->setInterpretation($string_45);
$outcomedeclaration_4->setLongInterpretation($string_46);
$outcomedeclaration_4->setNormalMaximum($boolean_32);
$outcomedeclaration_4->setNormalMinimum($boolean_33);
$outcomedeclaration_4->setMasteryValue($boolean_34);
$outcomedeclaration_4->setLookupTable($nullvalue_19);
$array_23 = array($outcomedeclaration_4);
$outcomedeclarationcollection_2 = new qtism\data\state\OutcomeDeclarationCollection($array_23);
$string_48 = "A";
$integer_15 = 0;
$string_49 = "";
$value_1 = new qtism\data\state\Value($string_48, $integer_15, $string_49);
$array_24 = array($value_1);
$valuecollection_1 = new qtism\data\state\ValueCollection($array_24);
$string_50 = "";
$correctresponse_1 = new qtism\data\state\CorrectResponse($valuecollection_1, $string_50);
$nullvalue_21 = null;
$nullvalue_22 = null;
$string_51 = "RESPONSE";
$integer_16 = 0;
$integer_17 = 0;
$nullvalue_23 = null;
$responsedeclaration_1 = new qtism\data\state\ResponseDeclaration($string_51, $integer_16, $integer_17, $nullvalue_23);
$responsedeclaration_1->setCorrectResponse($correctresponse_1);
$responsedeclaration_1->setMapping($nullvalue_21);
$responsedeclaration_1->setAreaMapping($nullvalue_22);
$array_25 = array($responsedeclaration_1);
$responsedeclarationcollection_1 = new qtism\data\state\ResponseDeclarationCollection($array_25);
$string_52 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_53 = "";
$array_26 = array();
$responserulecollection_1 = new qtism\data\rules\ResponseRuleCollection($array_26);
$responseprocessing_1 = new qtism\data\processing\ResponseProcessing($responserulecollection_1);
$responseprocessing_1->setTemplate($string_52);
$responseprocessing_1->setTemplateLocation($string_53);
$boolean_35 = false;
$boolean_36 = false;
$array_27 = array();
$variablemappingcollection_1 = new qtism\data\state\VariableMappingCollection($array_27);
$array_28 = array();
$weightcollection_1 = new qtism\data\state\WeightCollection($array_28);
$array_29 = array();
$templatedefaultcollection_1 = new qtism\data\state\TemplateDefaultCollection($array_29);
$boolean_37 = false;
$boolean_38 = false;
$array_30 = array();
$preconditioncollection_2 = new qtism\data\rules\PreConditionCollection($array_30);
$array_31 = array();
$branchrulecollection_2 = new qtism\data\rules\BranchRuleCollection($array_31);
$integer_18 = 0;
$boolean_39 = false;
$boolean_40 = true;
$boolean_41 = false;
$boolean_42 = false;
$boolean_43 = false;
$boolean_44 = true;
$itemsessioncontrol_2 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_2->setMaxAttempts($integer_18);
$itemsessioncontrol_2->setShowFeedback($boolean_39);
$itemsessioncontrol_2->setAllowReview($boolean_40);
$itemsessioncontrol_2->setShowSolution($boolean_41);
$itemsessioncontrol_2->setAllowComment($boolean_42);
$itemsessioncontrol_2->setValidateResponses($boolean_43);
$itemsessioncontrol_2->setAllowSkipping($boolean_44);
$nullvalue_24 = null;
$string_54 = "I104_02488-09";
$string_55 = "http://tao.local/tao.rdf#i5e28323fe4b9411408b8f46a2182e97af0|http://tao.local/tao.rdf#i5e283280c87b811408"
    . "e86d762176d98ea7+|http://tao.local/tao.rdf#i5e283280c880011408726cb946e22a83d6-";
$string_56 = "x-tao-option-reviewScreen";
$string_57 = "x-tao-option-markReview";
$string_58 = "x-tao-option-exit";
$string_59 = "x-tao-option-nextSection";
$string_60 = "x-tao-option-nextSectionWarning";
$string_61 = "x-tao-option-eliminator";
$string_62 = "x-tao-option-answerMasking";
$string_63 = "x-tao-option-areaMasking";
$string_64 = "x-tao-option-calculator";
$string_65 = "x-tao-option-highlighter";
$string_66 = "x-tao-option-magnifier";
$string_67 = "x-tao-option-scratchpad";
$string_68 = "x-tao-option-line-reader";
$string_69 = "x-tao-proctored-auto-pause";
$string_70 = "x-tao-option-answerMasking";
$string_71 = "x-tao-option-areaMasking";
$string_72 = "x-tao-option-lineReader";
$string_73 = "x-tao-option-magnifier";
$string_74 = "x-tao-option-zoom";
$string_75 = "x-tao-option-eliminator";
$array_32 = [
    $string_56,
    $string_57,
    $string_58,
    $string_59,
    $string_60,
    $string_61,
    $string_62,
    $string_63,
    $string_64,
    $string_65,
    $string_66,
    $string_67,
    $string_68,
    $string_69,
    $string_70,
    $string_71,
    $string_72,
    $string_73,
    $string_74,
    $string_75,
];
$identifiercollection_1 = new qtism\common\collections\IdentifierCollection($array_32);
$extendedassessmentitemref_1 = new qtism\data\ExtendedAssessmentItemRef(
    $string_54,
    $string_55,
    $identifiercollection_1
);
$extendedassessmentitemref_1->setOutcomeDeclarations($outcomedeclarationcollection_2);
$extendedassessmentitemref_1->setResponseDeclarations($responsedeclarationcollection_1);
$extendedassessmentitemref_1->setResponseProcessing($responseprocessing_1);
$extendedassessmentitemref_1->setAdaptive($boolean_35);
$extendedassessmentitemref_1->setTimeDependent($boolean_36);
$extendedassessmentitemref_1->setVariableMappings($variablemappingcollection_1);
$extendedassessmentitemref_1->setWeights($weightcollection_1);
$extendedassessmentitemref_1->setTemplateDefaults($templatedefaultcollection_1);
$extendedassessmentitemref_1->setRequired($boolean_37);
$extendedassessmentitemref_1->setFixed($boolean_38);
$extendedassessmentitemref_1->setPreConditions($preconditioncollection_2);
$extendedassessmentitemref_1->setBranchRules($branchrulecollection_2);
$extendedassessmentitemref_1->setItemSessionControl($itemsessioncontrol_2);
$extendedassessmentitemref_1->setTimeLimits($nullvalue_24);
$array_33 = array();
$viewcollection_5 = new qtism\data\ViewCollection($array_33);
$string_76 = "";
$string_77 = "";
$boolean_45 = false;
$boolean_46 = false;
$boolean_47 = false;
$nullvalue_25 = null;
$string_78 = "SCORE";
$integer_19 = 3;
$integer_20 = 0;
$nullvalue_26 = null;
$outcomedeclaration_5 = new qtism\data\state\OutcomeDeclaration($string_78, $integer_19, $integer_20, $nullvalue_26);
$outcomedeclaration_5->setViews($viewcollection_5);
$outcomedeclaration_5->setInterpretation($string_76);
$outcomedeclaration_5->setLongInterpretation($string_77);
$outcomedeclaration_5->setNormalMaximum($boolean_45);
$outcomedeclaration_5->setNormalMinimum($boolean_46);
$outcomedeclaration_5->setMasteryValue($boolean_47);
$outcomedeclaration_5->setLookupTable($nullvalue_25);
$array_34 = array($outcomedeclaration_5);
$outcomedeclarationcollection_3 = new qtism\data\state\OutcomeDeclarationCollection($array_34);
$string_79 = "B";
$integer_21 = 0;
$string_80 = "";
$value_2 = new qtism\data\state\Value($string_79, $integer_21, $string_80);
$array_35 = array($value_2);
$valuecollection_2 = new qtism\data\state\ValueCollection($array_35);
$string_81 = "";
$correctresponse_2 = new qtism\data\state\CorrectResponse($valuecollection_2, $string_81);
$nullvalue_27 = null;
$nullvalue_28 = null;
$string_82 = "RESPONSE";
$integer_22 = 0;
$integer_23 = 0;
$nullvalue_29 = null;
$responsedeclaration_2 = new qtism\data\state\ResponseDeclaration($string_82, $integer_22, $integer_23, $nullvalue_29);
$responsedeclaration_2->setCorrectResponse($correctresponse_2);
$responsedeclaration_2->setMapping($nullvalue_27);
$responsedeclaration_2->setAreaMapping($nullvalue_28);
$array_36 = array($responsedeclaration_2);
$responsedeclarationcollection_2 = new qtism\data\state\ResponseDeclarationCollection($array_36);
$string_83 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_84 = "";
$array_37 = array();
$responserulecollection_2 = new qtism\data\rules\ResponseRuleCollection($array_37);
$responseprocessing_2 = new qtism\data\processing\ResponseProcessing($responserulecollection_2);
$responseprocessing_2->setTemplate($string_83);
$responseprocessing_2->setTemplateLocation($string_84);
$boolean_48 = false;
$boolean_49 = false;
$array_38 = array();
$variablemappingcollection_2 = new qtism\data\state\VariableMappingCollection($array_38);
$array_39 = array();
$weightcollection_2 = new qtism\data\state\WeightCollection($array_39);
$array_40 = array();
$templatedefaultcollection_2 = new qtism\data\state\TemplateDefaultCollection($array_40);
$boolean_50 = false;
$boolean_51 = false;
$array_41 = array();
$preconditioncollection_3 = new qtism\data\rules\PreConditionCollection($array_41);
$array_42 = array();
$branchrulecollection_3 = new qtism\data\rules\BranchRuleCollection($array_42);
$integer_24 = 0;
$boolean_52 = false;
$boolean_53 = true;
$boolean_54 = false;
$boolean_55 = false;
$boolean_56 = false;
$boolean_57 = true;
$itemsessioncontrol_3 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_3->setMaxAttempts($integer_24);
$itemsessioncontrol_3->setShowFeedback($boolean_52);
$itemsessioncontrol_3->setAllowReview($boolean_53);
$itemsessioncontrol_3->setShowSolution($boolean_54);
$itemsessioncontrol_3->setAllowComment($boolean_55);
$itemsessioncontrol_3->setValidateResponses($boolean_56);
$itemsessioncontrol_3->setAllowSkipping($boolean_57);
$nullvalue_30 = null;
$string_85 = "I104_02471-12";
$string_86 = "http://tao.local/tao.rdf#i5e2832489611211408ac68c3b134292822|http://tao.local/tao.rdf#i5e283280d6c6d11408"
    . "fa714f8561f4cf21+|http://tao.local/tao.rdf#i5e283280d6cc01140846119b6aeaf064c8-";
$string_87 = "x-tao-option-reviewScreen";
$string_88 = "x-tao-option-markReview";
$string_89 = "x-tao-option-exit";
$string_90 = "x-tao-option-nextSection";
$string_91 = "x-tao-option-nextSectionWarning";
$string_92 = "x-tao-option-eliminator";
$string_93 = "x-tao-option-answerMasking";
$string_94 = "x-tao-option-areaMasking";
$string_95 = "x-tao-option-calculator";
$string_96 = "x-tao-option-highlighter";
$string_97 = "x-tao-option-magnifier";
$string_98 = "x-tao-option-scratchpad";
$string_99 = "x-tao-option-line-reader";
$string_100 = "x-tao-proctored-auto-pause";
$string_101 = "x-tao-option-answerMasking";
$string_102 = "x-tao-option-areaMasking";
$string_103 = "x-tao-option-lineReader";
$string_104 = "x-tao-option-magnifier";
$string_105 = "x-tao-option-zoom";
$string_106 = "x-tao-option-eliminator";
$array_43 = [
    $string_87,
    $string_88,
    $string_89,
    $string_90,
    $string_91,
    $string_92,
    $string_93,
    $string_94,
    $string_95,
    $string_96,
    $string_97,
    $string_98,
    $string_99,
    $string_100,
    $string_101,
    $string_102,
    $string_103,
    $string_104,
    $string_105,
    $string_106,
];
$identifiercollection_2 = new qtism\common\collections\IdentifierCollection($array_43);
$extendedassessmentitemref_2 = new qtism\data\ExtendedAssessmentItemRef(
    $string_85,
    $string_86,
    $identifiercollection_2
);
$extendedassessmentitemref_2->setOutcomeDeclarations($outcomedeclarationcollection_3);
$extendedassessmentitemref_2->setResponseDeclarations($responsedeclarationcollection_2);
$extendedassessmentitemref_2->setResponseProcessing($responseprocessing_2);
$extendedassessmentitemref_2->setAdaptive($boolean_48);
$extendedassessmentitemref_2->setTimeDependent($boolean_49);
$extendedassessmentitemref_2->setVariableMappings($variablemappingcollection_2);
$extendedassessmentitemref_2->setWeights($weightcollection_2);
$extendedassessmentitemref_2->setTemplateDefaults($templatedefaultcollection_2);
$extendedassessmentitemref_2->setRequired($boolean_50);
$extendedassessmentitemref_2->setFixed($boolean_51);
$extendedassessmentitemref_2->setPreConditions($preconditioncollection_3);
$extendedassessmentitemref_2->setBranchRules($branchrulecollection_3);
$extendedassessmentitemref_2->setItemSessionControl($itemsessioncontrol_3);
$extendedassessmentitemref_2->setTimeLimits($nullvalue_30);
$array_44 = array();
$viewcollection_6 = new qtism\data\ViewCollection($array_44);
$string_107 = "";
$string_108 = "";
$boolean_58 = false;
$boolean_59 = false;
$boolean_60 = false;
$nullvalue_31 = null;
$string_109 = "SCORE";
$integer_25 = 3;
$integer_26 = 0;
$nullvalue_32 = null;
$outcomedeclaration_6 = new qtism\data\state\OutcomeDeclaration($string_109, $integer_25, $integer_26, $nullvalue_32);
$outcomedeclaration_6->setViews($viewcollection_6);
$outcomedeclaration_6->setInterpretation($string_107);
$outcomedeclaration_6->setLongInterpretation($string_108);
$outcomedeclaration_6->setNormalMaximum($boolean_58);
$outcomedeclaration_6->setNormalMinimum($boolean_59);
$outcomedeclaration_6->setMasteryValue($boolean_60);
$outcomedeclaration_6->setLookupTable($nullvalue_31);
$array_45 = array($outcomedeclaration_6);
$outcomedeclarationcollection_4 = new qtism\data\state\OutcomeDeclarationCollection($array_45);
$string_110 = "A";
$integer_27 = 0;
$string_111 = "";
$value_3 = new qtism\data\state\Value($string_110, $integer_27, $string_111);
$array_46 = array($value_3);
$valuecollection_3 = new qtism\data\state\ValueCollection($array_46);
$string_112 = "";
$correctresponse_3 = new qtism\data\state\CorrectResponse($valuecollection_3, $string_112);
$nullvalue_33 = null;
$nullvalue_34 = null;
$string_113 = "RESPONSE";
$integer_28 = 0;
$integer_29 = 0;
$nullvalue_35 = null;
$responsedeclaration_3 = new qtism\data\state\ResponseDeclaration($string_113, $integer_28, $integer_29, $nullvalue_35);
$responsedeclaration_3->setCorrectResponse($correctresponse_3);
$responsedeclaration_3->setMapping($nullvalue_33);
$responsedeclaration_3->setAreaMapping($nullvalue_34);
$array_47 = array($responsedeclaration_3);
$responsedeclarationcollection_3 = new qtism\data\state\ResponseDeclarationCollection($array_47);
$string_114 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_115 = "";
$array_48 = array();
$responserulecollection_3 = new qtism\data\rules\ResponseRuleCollection($array_48);
$responseprocessing_3 = new qtism\data\processing\ResponseProcessing($responserulecollection_3);
$responseprocessing_3->setTemplate($string_114);
$responseprocessing_3->setTemplateLocation($string_115);
$boolean_61 = false;
$boolean_62 = false;
$array_49 = array();
$variablemappingcollection_3 = new qtism\data\state\VariableMappingCollection($array_49);
$array_50 = array();
$weightcollection_3 = new qtism\data\state\WeightCollection($array_50);
$array_51 = array();
$templatedefaultcollection_3 = new qtism\data\state\TemplateDefaultCollection($array_51);
$boolean_63 = false;
$boolean_64 = false;
$array_52 = array();
$preconditioncollection_4 = new qtism\data\rules\PreConditionCollection($array_52);
$array_53 = array();
$branchrulecollection_4 = new qtism\data\rules\BranchRuleCollection($array_53);
$integer_30 = 0;
$boolean_65 = false;
$boolean_66 = true;
$boolean_67 = false;
$boolean_68 = false;
$boolean_69 = false;
$boolean_70 = true;
$itemsessioncontrol_4 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_4->setMaxAttempts($integer_30);
$itemsessioncontrol_4->setShowFeedback($boolean_65);
$itemsessioncontrol_4->setAllowReview($boolean_66);
$itemsessioncontrol_4->setShowSolution($boolean_67);
$itemsessioncontrol_4->setAllowComment($boolean_68);
$itemsessioncontrol_4->setValidateResponses($boolean_69);
$itemsessioncontrol_4->setAllowSkipping($boolean_70);
$nullvalue_36 = null;
$string_116 = "I104_02471-18";
$string_117 = "http://tao.local/tao.rdf#i5e283250be78611408ec7e230337093279|http://tao.local/tao.rdf#i5e283280e5bd11140"
    . "845ba4b23c47256b1+|http://tao.local/tao.rdf#i5e283280e5c1d11408bbed2dc93786c71a-";
$string_118 = "x-tao-option-reviewScreen";
$string_119 = "x-tao-option-markReview";
$string_120 = "x-tao-option-exit";
$string_121 = "x-tao-option-nextSection";
$string_122 = "x-tao-option-nextSectionWarning";
$string_123 = "x-tao-option-eliminator";
$string_124 = "x-tao-option-answerMasking";
$string_125 = "x-tao-option-areaMasking";
$string_126 = "x-tao-option-calculator";
$string_127 = "x-tao-option-highlighter";
$string_128 = "x-tao-option-magnifier";
$string_129 = "x-tao-option-scratchpad";
$string_130 = "x-tao-option-line-reader";
$string_131 = "x-tao-proctored-auto-pause";
$string_132 = "x-tao-option-answerMasking";
$string_133 = "x-tao-option-areaMasking";
$string_134 = "x-tao-option-lineReader";
$string_135 = "x-tao-option-magnifier";
$string_136 = "x-tao-option-zoom";
$string_137 = "x-tao-option-eliminator";
$array_54 = [
    $string_118,
    $string_119,
    $string_120,
    $string_121,
    $string_122,
    $string_123,
    $string_124,
    $string_125,
    $string_126,
    $string_127,
    $string_128,
    $string_129,
    $string_130,
    $string_131,
    $string_132,
    $string_133,
    $string_134,
    $string_135,
    $string_136,
    $string_137,
];
$identifiercollection_3 = new qtism\common\collections\IdentifierCollection($array_54);
$extendedassessmentitemref_3 = new qtism\data\ExtendedAssessmentItemRef(
    $string_116,
    $string_117,
    $identifiercollection_3
);
$extendedassessmentitemref_3->setOutcomeDeclarations($outcomedeclarationcollection_4);
$extendedassessmentitemref_3->setResponseDeclarations($responsedeclarationcollection_3);
$extendedassessmentitemref_3->setResponseProcessing($responseprocessing_3);
$extendedassessmentitemref_3->setAdaptive($boolean_61);
$extendedassessmentitemref_3->setTimeDependent($boolean_62);
$extendedassessmentitemref_3->setVariableMappings($variablemappingcollection_3);
$extendedassessmentitemref_3->setWeights($weightcollection_3);
$extendedassessmentitemref_3->setTemplateDefaults($templatedefaultcollection_3);
$extendedassessmentitemref_3->setRequired($boolean_63);
$extendedassessmentitemref_3->setFixed($boolean_64);
$extendedassessmentitemref_3->setPreConditions($preconditioncollection_4);
$extendedassessmentitemref_3->setBranchRules($branchrulecollection_4);
$extendedassessmentitemref_3->setItemSessionControl($itemsessioncontrol_4);
$extendedassessmentitemref_3->setTimeLimits($nullvalue_36);
$array_55 = array();
$viewcollection_7 = new qtism\data\ViewCollection($array_55);
$string_138 = "";
$string_139 = "";
$boolean_71 = false;
$boolean_72 = false;
$boolean_73 = false;
$nullvalue_37 = null;
$string_140 = "SCORE";
$integer_31 = 3;
$integer_32 = 0;
$nullvalue_38 = null;
$outcomedeclaration_7 = new qtism\data\state\OutcomeDeclaration($string_140, $integer_31, $integer_32, $nullvalue_38);
$outcomedeclaration_7->setViews($viewcollection_7);
$outcomedeclaration_7->setInterpretation($string_138);
$outcomedeclaration_7->setLongInterpretation($string_139);
$outcomedeclaration_7->setNormalMaximum($boolean_71);
$outcomedeclaration_7->setNormalMinimum($boolean_72);
$outcomedeclaration_7->setMasteryValue($boolean_73);
$outcomedeclaration_7->setLookupTable($nullvalue_37);
$array_56 = array($outcomedeclaration_7);
$outcomedeclarationcollection_5 = new qtism\data\state\OutcomeDeclarationCollection($array_56);
$string_141 = "D";
$integer_33 = 0;
$string_142 = "";
$value_4 = new qtism\data\state\Value($string_141, $integer_33, $string_142);
$array_57 = array($value_4);
$valuecollection_4 = new qtism\data\state\ValueCollection($array_57);
$string_143 = "";
$correctresponse_4 = new qtism\data\state\CorrectResponse($valuecollection_4, $string_143);
$nullvalue_39 = null;
$nullvalue_40 = null;
$string_144 = "RESPONSE";
$integer_34 = 0;
$integer_35 = 0;
$nullvalue_41 = null;
$responsedeclaration_4 = new qtism\data\state\ResponseDeclaration($string_144, $integer_34, $integer_35, $nullvalue_41);
$responsedeclaration_4->setCorrectResponse($correctresponse_4);
$responsedeclaration_4->setMapping($nullvalue_39);
$responsedeclaration_4->setAreaMapping($nullvalue_40);
$array_58 = array($responsedeclaration_4);
$responsedeclarationcollection_4 = new qtism\data\state\ResponseDeclarationCollection($array_58);
$string_145 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_146 = "";
$array_59 = array();
$responserulecollection_4 = new qtism\data\rules\ResponseRuleCollection($array_59);
$responseprocessing_4 = new qtism\data\processing\ResponseProcessing($responserulecollection_4);
$responseprocessing_4->setTemplate($string_145);
$responseprocessing_4->setTemplateLocation($string_146);
$boolean_74 = false;
$boolean_75 = false;
$array_60 = array();
$variablemappingcollection_4 = new qtism\data\state\VariableMappingCollection($array_60);
$array_61 = array();
$weightcollection_4 = new qtism\data\state\WeightCollection($array_61);
$array_62 = array();
$templatedefaultcollection_4 = new qtism\data\state\TemplateDefaultCollection($array_62);
$boolean_76 = false;
$boolean_77 = false;
$array_63 = array();
$preconditioncollection_5 = new qtism\data\rules\PreConditionCollection($array_63);
$array_64 = array();
$branchrulecollection_5 = new qtism\data\rules\BranchRuleCollection($array_64);
$integer_36 = 0;
$boolean_78 = false;
$boolean_79 = true;
$boolean_80 = false;
$boolean_81 = false;
$boolean_82 = false;
$boolean_83 = true;
$itemsessioncontrol_5 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_5->setMaxAttempts($integer_36);
$itemsessioncontrol_5->setShowFeedback($boolean_78);
$itemsessioncontrol_5->setAllowReview($boolean_79);
$itemsessioncontrol_5->setShowSolution($boolean_80);
$itemsessioncontrol_5->setAllowComment($boolean_81);
$itemsessioncontrol_5->setValidateResponses($boolean_82);
$itemsessioncontrol_5->setAllowSkipping($boolean_83);
$nullvalue_42 = null;
$string_147 = "item-1";
$string_148 = "http://tao.local/tao.rdf#i5e283258b01b811408fccaa1ef75ee5d06|http://tao.local/tao.rdf#i5e283280f3fa41140"
    . "85dce517691635d3f+|http://tao.local/tao.rdf#i5e283280f4016114082b931c126f6ec6bb-";
$string_149 = "x-tao-option-reviewScreen";
$string_150 = "x-tao-option-markReview";
$string_151 = "x-tao-option-exit";
$string_152 = "x-tao-option-nextSection";
$string_153 = "x-tao-option-nextSectionWarning";
$string_154 = "x-tao-option-eliminator";
$string_155 = "x-tao-option-answerMasking";
$string_156 = "x-tao-option-areaMasking";
$string_157 = "x-tao-option-calculator";
$string_158 = "x-tao-option-highlighter";
$string_159 = "x-tao-option-magnifier";
$string_160 = "x-tao-option-scratchpad";
$string_161 = "x-tao-option-line-reader";
$string_162 = "x-tao-proctored-auto-pause";
$string_163 = "x-tao-option-answerMasking";
$string_164 = "x-tao-option-areaMasking";
$string_165 = "x-tao-option-lineReader";
$string_166 = "x-tao-option-magnifier";
$string_167 = "x-tao-option-zoom";
$string_168 = "x-tao-option-eliminator";
$array_65 = [
    $string_149,
    $string_150,
    $string_151,
    $string_152,
    $string_153,
    $string_154,
    $string_155,
    $string_156,
    $string_157,
    $string_158,
    $string_159,
    $string_160,
    $string_161,
    $string_162,
    $string_163,
    $string_164,
    $string_165,
    $string_166,
    $string_167,
    $string_168,
];
$identifiercollection_4 = new qtism\common\collections\IdentifierCollection($array_65);
$extendedassessmentitemref_4 = new qtism\data\ExtendedAssessmentItemRef(
    $string_147,
    $string_148,
    $identifiercollection_4
);
$extendedassessmentitemref_4->setOutcomeDeclarations($outcomedeclarationcollection_5);
$extendedassessmentitemref_4->setResponseDeclarations($responsedeclarationcollection_4);
$extendedassessmentitemref_4->setResponseProcessing($responseprocessing_4);
$extendedassessmentitemref_4->setAdaptive($boolean_74);
$extendedassessmentitemref_4->setTimeDependent($boolean_75);
$extendedassessmentitemref_4->setVariableMappings($variablemappingcollection_4);
$extendedassessmentitemref_4->setWeights($weightcollection_4);
$extendedassessmentitemref_4->setTemplateDefaults($templatedefaultcollection_4);
$extendedassessmentitemref_4->setRequired($boolean_76);
$extendedassessmentitemref_4->setFixed($boolean_77);
$extendedassessmentitemref_4->setPreConditions($preconditioncollection_5);
$extendedassessmentitemref_4->setBranchRules($branchrulecollection_5);
$extendedassessmentitemref_4->setItemSessionControl($itemsessioncontrol_5);
$extendedassessmentitemref_4->setTimeLimits($nullvalue_42);
$array_66 = array();
$viewcollection_8 = new qtism\data\ViewCollection($array_66);
$string_169 = "";
$string_170 = "";
$boolean_84 = false;
$boolean_85 = false;
$boolean_86 = false;
$nullvalue_43 = null;
$string_171 = "SCORE";
$integer_37 = 3;
$integer_38 = 0;
$nullvalue_44 = null;
$outcomedeclaration_8 = new qtism\data\state\OutcomeDeclaration($string_171, $integer_37, $integer_38, $nullvalue_44);
$outcomedeclaration_8->setViews($viewcollection_8);
$outcomedeclaration_8->setInterpretation($string_169);
$outcomedeclaration_8->setLongInterpretation($string_170);
$outcomedeclaration_8->setNormalMaximum($boolean_84);
$outcomedeclaration_8->setNormalMinimum($boolean_85);
$outcomedeclaration_8->setMasteryValue($boolean_86);
$outcomedeclaration_8->setLookupTable($nullvalue_43);
$array_67 = array($outcomedeclaration_8);
$outcomedeclarationcollection_6 = new qtism\data\state\OutcomeDeclarationCollection($array_67);
$string_172 = "D";
$integer_39 = 0;
$string_173 = "";
$value_5 = new qtism\data\state\Value($string_172, $integer_39, $string_173);
$array_68 = array($value_5);
$valuecollection_5 = new qtism\data\state\ValueCollection($array_68);
$string_174 = "";
$correctresponse_5 = new qtism\data\state\CorrectResponse($valuecollection_5, $string_174);
$nullvalue_45 = null;
$nullvalue_46 = null;
$string_175 = "RESPONSE";
$integer_40 = 0;
$integer_41 = 0;
$nullvalue_47 = null;
$responsedeclaration_5 = new qtism\data\state\ResponseDeclaration($string_175, $integer_40, $integer_41, $nullvalue_47);
$responsedeclaration_5->setCorrectResponse($correctresponse_5);
$responsedeclaration_5->setMapping($nullvalue_45);
$responsedeclaration_5->setAreaMapping($nullvalue_46);
$array_69 = array($responsedeclaration_5);
$responsedeclarationcollection_5 = new qtism\data\state\ResponseDeclarationCollection($array_69);
$string_176 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_177 = "";
$array_70 = array();
$responserulecollection_5 = new qtism\data\rules\ResponseRuleCollection($array_70);
$responseprocessing_5 = new qtism\data\processing\ResponseProcessing($responserulecollection_5);
$responseprocessing_5->setTemplate($string_176);
$responseprocessing_5->setTemplateLocation($string_177);
$boolean_87 = false;
$boolean_88 = false;
$array_71 = array();
$variablemappingcollection_5 = new qtism\data\state\VariableMappingCollection($array_71);
$array_72 = array();
$weightcollection_5 = new qtism\data\state\WeightCollection($array_72);
$array_73 = array();
$templatedefaultcollection_5 = new qtism\data\state\TemplateDefaultCollection($array_73);
$boolean_89 = false;
$boolean_90 = false;
$array_74 = array();
$preconditioncollection_6 = new qtism\data\rules\PreConditionCollection($array_74);
$array_75 = array();
$branchrulecollection_6 = new qtism\data\rules\BranchRuleCollection($array_75);
$integer_42 = 0;
$boolean_91 = false;
$boolean_92 = true;
$boolean_93 = false;
$boolean_94 = false;
$boolean_95 = false;
$boolean_96 = true;
$itemsessioncontrol_6 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_6->setMaxAttempts($integer_42);
$itemsessioncontrol_6->setShowFeedback($boolean_91);
$itemsessioncontrol_6->setAllowReview($boolean_92);
$itemsessioncontrol_6->setShowSolution($boolean_93);
$itemsessioncontrol_6->setAllowComment($boolean_94);
$itemsessioncontrol_6->setValidateResponses($boolean_95);
$itemsessioncontrol_6->setAllowSkipping($boolean_96);
$nullvalue_48 = null;
$string_178 = "item-2";
$string_179 = "http://tao.local/tao.rdf#i5e28325f48c2a114080965c8b667a3f8f7|http://tao.local/tao.rdf#i5e283281119b71140"
    . "8b895b3d76d7b8338+|http://tao.local/tao.rdf#i5e28328111a01114085ca65784b719d1a1-";
$string_180 = "x-tao-option-reviewScreen";
$string_181 = "x-tao-option-markReview";
$string_182 = "x-tao-option-exit";
$string_183 = "x-tao-option-nextSection";
$string_184 = "x-tao-option-nextSectionWarning";
$string_185 = "x-tao-option-eliminator";
$string_186 = "x-tao-option-answerMasking";
$string_187 = "x-tao-option-areaMasking";
$string_188 = "x-tao-option-calculator";
$string_189 = "x-tao-option-highlighter";
$string_190 = "x-tao-option-magnifier";
$string_191 = "x-tao-option-scratchpad";
$string_192 = "x-tao-option-line-reader";
$string_193 = "x-tao-proctored-auto-pause";
$string_194 = "x-tao-option-answerMasking";
$string_195 = "x-tao-option-areaMasking";
$string_196 = "x-tao-option-lineReader";
$string_197 = "x-tao-option-magnifier";
$string_198 = "x-tao-option-zoom";
$string_199 = "x-tao-option-eliminator";
$array_76 = [
    $string_180,
    $string_181,
    $string_182,
    $string_183,
    $string_184,
    $string_185,
    $string_186,
    $string_187,
    $string_188,
    $string_189,
    $string_190,
    $string_191,
    $string_192,
    $string_193,
    $string_194,
    $string_195,
    $string_196,
    $string_197,
    $string_198,
    $string_199,
];
$identifiercollection_5 = new qtism\common\collections\IdentifierCollection($array_76);
$extendedassessmentitemref_5 = new qtism\data\ExtendedAssessmentItemRef(
    $string_178,
    $string_179,
    $identifiercollection_5
);
$extendedassessmentitemref_5->setOutcomeDeclarations($outcomedeclarationcollection_6);
$extendedassessmentitemref_5->setResponseDeclarations($responsedeclarationcollection_5);
$extendedassessmentitemref_5->setResponseProcessing($responseprocessing_5);
$extendedassessmentitemref_5->setAdaptive($boolean_87);
$extendedassessmentitemref_5->setTimeDependent($boolean_88);
$extendedassessmentitemref_5->setVariableMappings($variablemappingcollection_5);
$extendedassessmentitemref_5->setWeights($weightcollection_5);
$extendedassessmentitemref_5->setTemplateDefaults($templatedefaultcollection_5);
$extendedassessmentitemref_5->setRequired($boolean_89);
$extendedassessmentitemref_5->setFixed($boolean_90);
$extendedassessmentitemref_5->setPreConditions($preconditioncollection_6);
$extendedassessmentitemref_5->setBranchRules($branchrulecollection_6);
$extendedassessmentitemref_5->setItemSessionControl($itemsessioncontrol_6);
$extendedassessmentitemref_5->setTimeLimits($nullvalue_48);
$array_77 = array();
$viewcollection_9 = new qtism\data\ViewCollection($array_77);
$string_200 = "";
$string_201 = "";
$boolean_97 = false;
$boolean_98 = false;
$boolean_99 = false;
$nullvalue_49 = null;
$string_202 = "SCORE";
$integer_43 = 3;
$integer_44 = 0;
$nullvalue_50 = null;
$outcomedeclaration_9 = new qtism\data\state\OutcomeDeclaration($string_202, $integer_43, $integer_44, $nullvalue_50);
$outcomedeclaration_9->setViews($viewcollection_9);
$outcomedeclaration_9->setInterpretation($string_200);
$outcomedeclaration_9->setLongInterpretation($string_201);
$outcomedeclaration_9->setNormalMaximum($boolean_97);
$outcomedeclaration_9->setNormalMinimum($boolean_98);
$outcomedeclaration_9->setMasteryValue($boolean_99);
$outcomedeclaration_9->setLookupTable($nullvalue_49);
$array_78 = array($outcomedeclaration_9);
$outcomedeclarationcollection_7 = new qtism\data\state\OutcomeDeclarationCollection($array_78);
$string_203 = "B";
$integer_45 = 0;
$string_204 = "";
$value_6 = new qtism\data\state\Value($string_203, $integer_45, $string_204);
$array_79 = array($value_6);
$valuecollection_6 = new qtism\data\state\ValueCollection($array_79);
$string_205 = "";
$correctresponse_6 = new qtism\data\state\CorrectResponse($valuecollection_6, $string_205);
$nullvalue_51 = null;
$nullvalue_52 = null;
$string_206 = "RESPONSE";
$integer_46 = 0;
$integer_47 = 0;
$nullvalue_53 = null;
$responsedeclaration_6 = new qtism\data\state\ResponseDeclaration($string_206, $integer_46, $integer_47, $nullvalue_53);
$responsedeclaration_6->setCorrectResponse($correctresponse_6);
$responsedeclaration_6->setMapping($nullvalue_51);
$responsedeclaration_6->setAreaMapping($nullvalue_52);
$array_80 = array($responsedeclaration_6);
$responsedeclarationcollection_6 = new qtism\data\state\ResponseDeclarationCollection($array_80);
$string_207 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_208 = "";
$array_81 = array();
$responserulecollection_6 = new qtism\data\rules\ResponseRuleCollection($array_81);
$responseprocessing_6 = new qtism\data\processing\ResponseProcessing($responserulecollection_6);
$responseprocessing_6->setTemplate($string_207);
$responseprocessing_6->setTemplateLocation($string_208);
$boolean_100 = false;
$boolean_101 = false;
$array_82 = array();
$variablemappingcollection_6 = new qtism\data\state\VariableMappingCollection($array_82);
$array_83 = array();
$weightcollection_6 = new qtism\data\state\WeightCollection($array_83);
$array_84 = array();
$templatedefaultcollection_6 = new qtism\data\state\TemplateDefaultCollection($array_84);
$boolean_102 = false;
$boolean_103 = false;
$array_85 = array();
$preconditioncollection_7 = new qtism\data\rules\PreConditionCollection($array_85);
$array_86 = array();
$branchrulecollection_7 = new qtism\data\rules\BranchRuleCollection($array_86);
$integer_48 = 0;
$boolean_104 = false;
$boolean_105 = true;
$boolean_106 = false;
$boolean_107 = false;
$boolean_108 = false;
$boolean_109 = true;
$itemsessioncontrol_7 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_7->setMaxAttempts($integer_48);
$itemsessioncontrol_7->setShowFeedback($boolean_104);
$itemsessioncontrol_7->setAllowReview($boolean_105);
$itemsessioncontrol_7->setShowSolution($boolean_106);
$itemsessioncontrol_7->setAllowComment($boolean_107);
$itemsessioncontrol_7->setValidateResponses($boolean_108);
$itemsessioncontrol_7->setAllowSkipping($boolean_109);
$nullvalue_54 = null;
$string_209 = "item-3";
$string_210 = "http://tao.local/tao.rdf#i5e283265a6a7c114081e9f907275ab09f0|http://tao.local/tao.rdf#i5e28328121c151140"
    . "8d6ff9168f273fd29+|http://tao.local/tao.rdf#i5e28328121c65114083fd0e6981167cb83-";
$string_211 = "x-tao-option-reviewScreen";
$string_212 = "x-tao-option-markReview";
$string_213 = "x-tao-option-exit";
$string_214 = "x-tao-option-nextSection";
$string_215 = "x-tao-option-nextSectionWarning";
$string_216 = "x-tao-option-eliminator";
$string_217 = "x-tao-option-answerMasking";
$string_218 = "x-tao-option-areaMasking";
$string_219 = "x-tao-option-calculator";
$string_220 = "x-tao-option-highlighter";
$string_221 = "x-tao-option-magnifier";
$string_222 = "x-tao-option-scratchpad";
$string_223 = "x-tao-option-line-reader";
$string_224 = "x-tao-proctored-auto-pause";
$string_225 = "x-tao-option-answerMasking";
$string_226 = "x-tao-option-areaMasking";
$string_227 = "x-tao-option-lineReader";
$string_228 = "x-tao-option-magnifier";
$string_229 = "x-tao-option-zoom";
$string_230 = "x-tao-option-eliminator";
$array_87 = [
    $string_211,
    $string_212,
    $string_213,
    $string_214,
    $string_215,
    $string_216,
    $string_217,
    $string_218,
    $string_219,
    $string_220,
    $string_221,
    $string_222,
    $string_223,
    $string_224,
    $string_225,
    $string_226,
    $string_227,
    $string_228,
    $string_229,
    $string_230,
];
$identifiercollection_6 = new qtism\common\collections\IdentifierCollection($array_87);
$extendedassessmentitemref_6 = new qtism\data\ExtendedAssessmentItemRef(
    $string_209,
    $string_210,
    $identifiercollection_6
);
$extendedassessmentitemref_6->setOutcomeDeclarations($outcomedeclarationcollection_7);
$extendedassessmentitemref_6->setResponseDeclarations($responsedeclarationcollection_6);
$extendedassessmentitemref_6->setResponseProcessing($responseprocessing_6);
$extendedassessmentitemref_6->setAdaptive($boolean_100);
$extendedassessmentitemref_6->setTimeDependent($boolean_101);
$extendedassessmentitemref_6->setVariableMappings($variablemappingcollection_6);
$extendedassessmentitemref_6->setWeights($weightcollection_6);
$extendedassessmentitemref_6->setTemplateDefaults($templatedefaultcollection_6);
$extendedassessmentitemref_6->setRequired($boolean_102);
$extendedassessmentitemref_6->setFixed($boolean_103);
$extendedassessmentitemref_6->setPreConditions($preconditioncollection_7);
$extendedassessmentitemref_6->setBranchRules($branchrulecollection_7);
$extendedassessmentitemref_6->setItemSessionControl($itemsessioncontrol_7);
$extendedassessmentitemref_6->setTimeLimits($nullvalue_54);
$array_88 = array();
$viewcollection_10 = new qtism\data\ViewCollection($array_88);
$string_231 = "";
$string_232 = "";
$boolean_110 = false;
$boolean_111 = false;
$boolean_112 = false;
$nullvalue_55 = null;
$string_233 = "SCORE";
$integer_49 = 3;
$integer_50 = 0;
$nullvalue_56 = null;
$outcomedeclaration_10 = new qtism\data\state\OutcomeDeclaration($string_233, $integer_49, $integer_50, $nullvalue_56);
$outcomedeclaration_10->setViews($viewcollection_10);
$outcomedeclaration_10->setInterpretation($string_231);
$outcomedeclaration_10->setLongInterpretation($string_232);
$outcomedeclaration_10->setNormalMaximum($boolean_110);
$outcomedeclaration_10->setNormalMinimum($boolean_111);
$outcomedeclaration_10->setMasteryValue($boolean_112);
$outcomedeclaration_10->setLookupTable($nullvalue_55);
$array_89 = array($outcomedeclaration_10);
$outcomedeclarationcollection_8 = new qtism\data\state\OutcomeDeclarationCollection($array_89);
$string_234 = "A";
$integer_51 = 0;
$string_235 = "";
$value_7 = new qtism\data\state\Value($string_234, $integer_51, $string_235);
$array_90 = array($value_7);
$valuecollection_7 = new qtism\data\state\ValueCollection($array_90);
$string_236 = "";
$correctresponse_7 = new qtism\data\state\CorrectResponse($valuecollection_7, $string_236);
$nullvalue_57 = null;
$nullvalue_58 = null;
$string_237 = "RESPONSE";
$integer_52 = 0;
$integer_53 = 0;
$nullvalue_59 = null;
$responsedeclaration_7 = new qtism\data\state\ResponseDeclaration($string_237, $integer_52, $integer_53, $nullvalue_59);
$responsedeclaration_7->setCorrectResponse($correctresponse_7);
$responsedeclaration_7->setMapping($nullvalue_57);
$responsedeclaration_7->setAreaMapping($nullvalue_58);
$array_91 = array($responsedeclaration_7);
$responsedeclarationcollection_7 = new qtism\data\state\ResponseDeclarationCollection($array_91);
$string_238 = "http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct";
$string_239 = "";
$array_92 = array();
$responserulecollection_7 = new qtism\data\rules\ResponseRuleCollection($array_92);
$responseprocessing_7 = new qtism\data\processing\ResponseProcessing($responserulecollection_7);
$responseprocessing_7->setTemplate($string_238);
$responseprocessing_7->setTemplateLocation($string_239);
$boolean_113 = false;
$boolean_114 = false;
$array_93 = array();
$variablemappingcollection_7 = new qtism\data\state\VariableMappingCollection($array_93);
$array_94 = array();
$weightcollection_7 = new qtism\data\state\WeightCollection($array_94);
$array_95 = array();
$templatedefaultcollection_7 = new qtism\data\state\TemplateDefaultCollection($array_95);
$boolean_115 = false;
$boolean_116 = false;
$array_96 = array();
$preconditioncollection_8 = new qtism\data\rules\PreConditionCollection($array_96);
$array_97 = array();
$branchrulecollection_8 = new qtism\data\rules\BranchRuleCollection($array_97);
$integer_54 = 0;
$boolean_117 = false;
$boolean_118 = true;
$boolean_119 = false;
$boolean_120 = false;
$boolean_121 = false;
$boolean_122 = true;
$itemsessioncontrol_8 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_8->setMaxAttempts($integer_54);
$itemsessioncontrol_8->setShowFeedback($boolean_117);
$itemsessioncontrol_8->setAllowReview($boolean_118);
$itemsessioncontrol_8->setShowSolution($boolean_119);
$itemsessioncontrol_8->setAllowComment($boolean_120);
$itemsessioncontrol_8->setValidateResponses($boolean_121);
$itemsessioncontrol_8->setAllowSkipping($boolean_122);
$nullvalue_60 = null;
$string_240 = "item-4";
$string_241 = "http://tao.local/tao.rdf#i5e28326c257f3114081d4cd51324ba549c|http://tao.local/tao.rdf#i5e28328133bc21140"
    . "85a2432d1344470dd+|http://tao.local/tao.rdf#i5e28328133c0a11408ed46cb6877ee6850-";
$string_242 = "x-tao-option-reviewScreen";
$string_243 = "x-tao-option-markReview";
$string_244 = "x-tao-option-exit";
$string_245 = "x-tao-option-nextSection";
$string_246 = "x-tao-option-nextSectionWarning";
$string_247 = "x-tao-option-eliminator";
$string_248 = "x-tao-option-answerMasking";
$string_249 = "x-tao-option-areaMasking";
$string_250 = "x-tao-option-calculator";
$string_251 = "x-tao-option-highlighter";
$string_252 = "x-tao-option-magnifier";
$string_253 = "x-tao-option-scratchpad";
$string_254 = "x-tao-option-line-reader";
$string_255 = "x-tao-proctored-auto-pause";
$string_256 = "x-tao-option-answerMasking";
$string_257 = "x-tao-option-areaMasking";
$string_258 = "x-tao-option-lineReader";
$string_259 = "x-tao-option-magnifier";
$string_260 = "x-tao-option-zoom";
$string_261 = "x-tao-option-eliminator";
$array_98 = [
    $string_242,
    $string_243,
    $string_244,
    $string_245,
    $string_246,
    $string_247,
    $string_248,
    $string_249,
    $string_250,
    $string_251,
    $string_252,
    $string_253,
    $string_254,
    $string_255,
    $string_256,
    $string_257,
    $string_258,
    $string_259,
    $string_260,
    $string_261,
];
$identifiercollection_7 = new qtism\common\collections\IdentifierCollection($array_98);
$extendedassessmentitemref_7 = new qtism\data\ExtendedAssessmentItemRef(
    $string_240,
    $string_241,
    $identifiercollection_7
);
$extendedassessmentitemref_7->setOutcomeDeclarations($outcomedeclarationcollection_8);
$extendedassessmentitemref_7->setResponseDeclarations($responsedeclarationcollection_7);
$extendedassessmentitemref_7->setResponseProcessing($responseprocessing_7);
$extendedassessmentitemref_7->setAdaptive($boolean_113);
$extendedassessmentitemref_7->setTimeDependent($boolean_114);
$extendedassessmentitemref_7->setVariableMappings($variablemappingcollection_7);
$extendedassessmentitemref_7->setWeights($weightcollection_7);
$extendedassessmentitemref_7->setTemplateDefaults($templatedefaultcollection_7);
$extendedassessmentitemref_7->setRequired($boolean_115);
$extendedassessmentitemref_7->setFixed($boolean_116);
$extendedassessmentitemref_7->setPreConditions($preconditioncollection_8);
$extendedassessmentitemref_7->setBranchRules($branchrulecollection_8);
$extendedassessmentitemref_7->setItemSessionControl($itemsessioncontrol_8);
$extendedassessmentitemref_7->setTimeLimits($nullvalue_60);
$array_99 = [
    $extendedassessmentitemref_0,
    $extendedassessmentitemref_1,
    $extendedassessmentitemref_2,
    $extendedassessmentitemref_3,
    $extendedassessmentitemref_4,
    $extendedassessmentitemref_5,
    $extendedassessmentitemref_6,
    $extendedassessmentitemref_7,
];
$sectionpartcollection_0 = new qtism\data\SectionPartCollection($array_99);
$boolean_123 = true;
$boolean_124 = false;
$array_100 = array();
$preconditioncollection_9 = new qtism\data\rules\PreConditionCollection($array_100);
$array_101 = array();
$branchrulecollection_9 = new qtism\data\rules\BranchRuleCollection($array_101);
$integer_55 = 0;
$boolean_125 = false;
$boolean_126 = true;
$boolean_127 = false;
$boolean_128 = false;
$boolean_129 = false;
$boolean_130 = true;
$itemsessioncontrol_9 = new qtism\data\ItemSessionControl();
$itemsessioncontrol_9->setMaxAttempts($integer_55);
$itemsessioncontrol_9->setShowFeedback($boolean_125);
$itemsessioncontrol_9->setAllowReview($boolean_126);
$itemsessioncontrol_9->setShowSolution($boolean_127);
$itemsessioncontrol_9->setAllowComment($boolean_128);
$itemsessioncontrol_9->setValidateResponses($boolean_129);
$itemsessioncontrol_9->setAllowSkipping($boolean_130);
$qtiduration_0 = new qtism\common\datatypes\QtiDuration("PT15S");
$qtiduration_1 = new qtism\common\datatypes\QtiDuration("PT2H");
$boolean_131 = false;
$timelimits_3 = new qtism\data\TimeLimits($qtiduration_0, $qtiduration_1, $boolean_131);
$string_262 = "ENG70A_1446";
$string_263 = "TAO Test English Assmt Title";
$boolean_132 = true;
$extendedassessmentsection_0 = new qtism\data\ExtendedAssessmentSection($string_262, $string_263, $boolean_132);
$extendedassessmentsection_0->setRubricBlockRefs($rubricblockrefcollection_0);
$extendedassessmentsection_0->setKeepTogether($boolean_17);
$extendedassessmentsection_0->setSelection($nullvalue_10);
$extendedassessmentsection_0->setOrdering($nullvalue_11);
$extendedassessmentsection_0->setRubricBlocks($rubricblockcollection_0);
$extendedassessmentsection_0->setSectionParts($sectionpartcollection_0);
$extendedassessmentsection_0->setRequired($boolean_123);
$extendedassessmentsection_0->setFixed($boolean_124);
$extendedassessmentsection_0->setPreConditions($preconditioncollection_9);
$extendedassessmentsection_0->setBranchRules($branchrulecollection_9);
$extendedassessmentsection_0->setItemSessionControl($itemsessioncontrol_9);
$extendedassessmentsection_0->setTimeLimits($timelimits_3);
$array_102 = array($extendedassessmentsection_0);
$sectionpartcollection_1 = new qtism\data\SectionPartCollection($array_102);
$integer_56 = 1;
$integer_57 = 0;
$testpart_0 = new qtism\data\TestPart($string_13, $sectionpartcollection_1, $integer_56, $integer_57);
$testpart_0->setPreConditions($preconditioncollection_0);
$testpart_0->setBranchRules($branchrulecollection_0);
$testpart_0->setItemSessionControl($itemsessioncontrol_0);
$testpart_0->setTimeLimits($timelimits_1);
$testpart_0->setTestFeedbacks($testfeedbackcollection_1);
$array_103 = array($testpart_0);
$testpartcollection_0 = new qtism\data\TestPartCollection($array_103);
$rootcomponent = new qtism\data\AssessmentTest($string_11, $string_12, $testpartcollection_0);
$rootcomponent->setToolName($string_0);
$rootcomponent->setToolVersion($string_1);
$rootcomponent->setOutcomeDeclarations($outcomedeclarationcollection_0);
$rootcomponent->setTimeLimits($timelimits_0);
$rootcomponent->setOutcomeProcessing($outcomeprocessing_0);
$rootcomponent->setTestFeedbacks($testfeedbackcollection_0);
