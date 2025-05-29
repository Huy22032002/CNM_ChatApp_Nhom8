import { Text, TouchableOpacity, Image, Linking } from "react-native";

const PDFView = ({ message }) => {
  const handleOpenPdf = () => {
    console.log("url: ", message.image_url);
    Linking.openURL(message.image_url);
  };

  return (
    <TouchableOpacity
      onPress={handleOpenPdf}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 10,
        borderRadius: 8,
        maxWidth: "100%",
        marginVertical: 5,
      }}
    >
      <Image
        source={require("../assets/pdf-icon.png")}
        style={{ width: 24, height: 24, marginRight: 10 }}
      />
      <Text numberOfLines={1} style={{ color: "#000", flexShrink: 1 }}>
        PDF File
      </Text>
    </TouchableOpacity>
  );
};

export default PDFView;
