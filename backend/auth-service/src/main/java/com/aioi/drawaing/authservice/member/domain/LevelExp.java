package com.aioi.drawaing.authservice.member.domain;

public enum LevelExp {
    LEVEL_1(1, 15), LEVEL_2(2, 15), LEVEL_3(3, 15), LEVEL_4(4, 15), LEVEL_5(5, 15),
    LEVEL_6(6, 30), LEVEL_7(7, 30), LEVEL_8(8, 30), LEVEL_9(9, 30), LEVEL_10(10, 30),
    LEVEL_11(11, 60), LEVEL_12(12, 60), LEVEL_13(13, 60), LEVEL_14(14, 60), LEVEL_15(15, 60),
    LEVEL_16(16, 60), LEVEL_17(17, 60), LEVEL_18(18, 60), LEVEL_19(19, 60), LEVEL_20(20, 60),
    LEVEL_21(21, 120), LEVEL_22(22, 120), LEVEL_23(23, 120), LEVEL_24(24, 120), LEVEL_25(25, 120),
    LEVEL_26(26, 120), LEVEL_27(27, 120), LEVEL_28(28, 120), LEVEL_29(29, 120), LEVEL_30(30, 120),
    LEVEL_31(31, 240), LEVEL_32(32, 240), LEVEL_33(33, 240), LEVEL_34(34, 240), LEVEL_35(35, 240),
    LEVEL_36(36, 240), LEVEL_37(37, 240), LEVEL_38(38, 240), LEVEL_39(39, 240), LEVEL_40(40, 240),
    LEVEL_41(41, 480), LEVEL_42(42, 480), LEVEL_43(43, 480), LEVEL_44(44, 480), LEVEL_45(45, 480),
    LEVEL_46(46, 480), LEVEL_47(47, 480), LEVEL_48(48, 480), LEVEL_49(49, 480), LEVEL_50(50, 480),
    LEVEL_51(51, 960), LEVEL_52(52, 960), LEVEL_53(53, 960), LEVEL_54(54, 960), LEVEL_55(55, 960),
    LEVEL_56(56, 960), LEVEL_57(57, 960), LEVEL_58(58, 960), LEVEL_59(59, 960), LEVEL_60(60, 960),
    LEVEL_61(61, 1920), LEVEL_62(62, 1920), LEVEL_63(63, 1920), LEVEL_64(64, 1920), LEVEL_65(65, 1920),
    LEVEL_66(66, 1920), LEVEL_67(67, 1920), LEVEL_68(68, 1920), LEVEL_69(69, 1920), LEVEL_70(70, 1920),
    LEVEL_71(71, 3840), LEVEL_72(72, 3840), LEVEL_73(73, 3840), LEVEL_74(74, 3840), LEVEL_75(75, 3840),
    LEVEL_76(76, 3840), LEVEL_77(77, 3840), LEVEL_78(78, 3840), LEVEL_79(79, 3840), LEVEL_80(80, 3840),
    LEVEL_81(81, 7680), LEVEL_82(82, 7680), LEVEL_83(83, 7680), LEVEL_84(84, 7680), LEVEL_85(85, 7680),
    LEVEL_86(86, 7680), LEVEL_87(87, 7680), LEVEL_88(88, 7680), LEVEL_89(89, 7680), LEVEL_90(90, 7680),
    LEVEL_91(91, 15360), LEVEL_92(92, 15360), LEVEL_93(93, 15360), LEVEL_94(94, 15360), LEVEL_95(95, 15360),
    LEVEL_96(96, 15360), LEVEL_97(97, 15360), LEVEL_98(98, 15360), LEVEL_99(99, 15360),
    LEVEL_100(100, 30720);

    private final int level;
    private final int expRequired;

    LevelExp(int level, int expRequired) {
        this.level = level;
        this.expRequired = expRequired;
    }

    public static int getExpRequired(int level) {
        for (LevelExp entry : values()) {
            if (entry.level == level) {
                return entry.expRequired;
            }
        }
        throw new IllegalArgumentException("Invalid level: " + level);
    }
}
