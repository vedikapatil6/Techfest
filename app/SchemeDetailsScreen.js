import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SchemeDetailsScreen = ({ scheme, onBack, onApplyNow }) => {
  const getIcon = () => {
    switch (scheme.iconType) {
      case 'health':
        return <Ionicons name="add" size={48} color="#ef4444" />;
      case 'finance':
        return <MaterialCommunityIcons name="gold" size={56} color="#fbbf24" />;
      case 'housing':
        return <Ionicons name="home" size={56} color="#f97316" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <View style={{
        backgroundColor: '#1e3a8a',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={{
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
            marginRight: 40,
          }}>
            Scheme Details
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            {getIcon()}
          </View>
          
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#1e3a8a',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            {scheme.title}
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            textAlign: 'center',
          }}>
            {scheme.subtitle}
          </Text>
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: 12,
          }}>
            Description
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#4b5563',
            lineHeight: 22,
          }}>
            {scheme.description}
          </Text>
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: 12,
          }}>
            Eligibility
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            padding: 12,
            borderRadius: 8,
          }}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={{
              fontSize: 14,
              color: '#4b5563',
              marginLeft: 10,
              flex: 1,
            }}>
              {scheme.eligibility}
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: 12,
          }}>
            Benefits
          </Text>
          {scheme.benefits.map((benefit, index) => (
            <View 
              key={index}
              style={{
                flexDirection: 'row',
                marginBottom: 12,
                alignItems: 'flex-start',
              }}
            >
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#1e3a8a',
                marginTop: 7,
                marginRight: 12,
              }} />
              <Text style={{
                fontSize: 14,
                color: '#4b5563',
                flex: 1,
                lineHeight: 20,
              }}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e3a8a',
            marginBottom: 12,
          }}>
            Required Documents
          </Text>
          {scheme.documents.map((document, index) => (
            <View 
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons name="document-text" size={18} color="#1e3a8a" />
              <Text style={{
                fontSize: 14,
                color: '#4b5563',
                marginLeft: 10,
                flex: 1,
              }}>
                {document}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
      }}>
        <TouchableOpacity 
          style={{
            backgroundColor: '#1e3a8a',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
          onPress={onApplyNow}
        >
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            Apply Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SchemeDetailsScreen;